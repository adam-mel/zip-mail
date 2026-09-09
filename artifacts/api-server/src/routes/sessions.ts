import { Router, type IRouter } from "express";
import { and, asc, eq, gt, lt } from "drizzle-orm";
import { db, mailboxMessagesTable, mailboxSessionsTable } from "@workspace/db";
import {
  CreateSessionBody,
  GetMessageParams,
  GetSessionParams,
  ListMessagesParams,
  RotateSessionBody,
  RotateSessionParams,
} from "@workspace/api-zod";
import {
  createProviderMailbox,
  deleteProviderMailbox,
  fetchProviderMessage,
  fetchProviderMessages,
  sanitizeIncomingHtml,
} from "../lib/mail-provider";

const router: IRouter = Router();
const MAX_DURATION = 7 * 24 * 60 * 60;
const MIN_DURATION = 60 * 60;
const ARCHIVE_SECONDS = 7 * 24 * 60 * 60;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit: number) {
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function parseDuration(value: unknown) {
  const duration = Number(value);
  if (!Number.isInteger(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
    return null;
  }
  return duration;
}

function mapSession(session: typeof mailboxSessionsTable.$inferSelect, messageCount = 0) {
  return {
    sessionId: session.sessionId,
    address: session.address,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    archiveUntil: session.archiveUntil.toISOString(),
    status: session.status as "active" | "archived" | "deleted",
    messageCount,
  };
}

async function messageCount(sessionId: string) {
  const rows = await db
    .select({ id: mailboxMessagesTable.id })
    .from(mailboxMessagesTable)
    .where(eq(mailboxMessagesTable.sessionId, sessionId));
  return rows.length;
}

async function archiveIfExpired(session: typeof mailboxSessionsTable.$inferSelect) {
  if (session.status === "active" && session.expiresAt <= new Date()) {
    await db
      .update(mailboxSessionsTable)
      .set({ status: "archived" })
      .where(eq(mailboxSessionsTable.sessionId, session.sessionId));
    await deleteProviderMailbox(session.providerToken, session.providerAccountId);
    return { ...session, status: "archived" };
  }
  return session;
}

async function getLiveSession(sessionId: string) {
  const rows = await db
    .select()
    .from(mailboxSessionsTable)
    .where(eq(mailboxSessionsTable.sessionId, sessionId))
    .limit(1);
  if (!rows[0]) return null;
  if (rows[0].archiveUntil <= new Date()) {
    await db.delete(mailboxSessionsTable).where(eq(mailboxSessionsTable.sessionId, sessionId));
    return null;
  }
  return archiveIfExpired(rows[0]);
}

async function createSession(durationSeconds: number) {
  const provider = await createProviderMailbox();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + durationSeconds * 1000);
  const archiveUntil = new Date(expiresAt.getTime() + ARCHIVE_SECONDS * 1000);
  const session = {
    sessionId: crypto.randomUUID(),
    address: provider.address,
    providerAccountId: provider.providerAccountId,
    providerToken: provider.providerToken,
    providerPassword: provider.providerPassword,
    createdAt,
    selectedDurationSeconds: String(durationSeconds),
    expiresAt,
    archiveUntil,
    status: "active",
  };
  await db.insert(mailboxSessionsTable).values(session);
  return session;
}

router.post("/sessions", async (req, res) => {
  if (!rateLimit(`create:${req.ip ?? "unknown"}`, 10)) {
    res.status(429).json({ error: "Too many inboxes created. Try again shortly." });
    return;
  }
  const parsed = CreateSessionBody.safeParse(req.body);
  const duration = parsed.success ? parseDuration(parsed.data.durationSeconds) : null;
  if (!duration) {
    res.status(400).json({ error: "Choose a duration between 1 hour and 7 days." });
    return;
  }
  try {
    const session = await createSession(duration);
    res.status(201).json(mapSession(session));
  } catch (error) {
    req.log.error({ err: error }, "Unable to create mailbox");
    res.status(502).json({ error: "The mailbox provider is temporarily unavailable." });
  }
});

router.get("/sessions/:sessionId", async (req, res) => {
  const parsed = GetSessionParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Inbox not found." });
    return;
  }
  try {
    const session = await getLiveSession(parsed.data.sessionId);
    if (!session) {
      res.status(404).json({ error: "This inbox has expired and was removed." });
      return;
    }
    res.json(mapSession(session, await messageCount(session.sessionId)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to load mailbox");
    res.status(500).json({ error: "Unable to load this inbox." });
  }
});

router.get("/sessions/:sessionId/messages", async (req, res) => {
  const parsed = ListMessagesParams.safeParse(req.params);
  if (!parsed.success || !rateLimit(`refresh:${req.ip ?? "unknown"}`, 60)) {
    res.status(parsed.success ? 429 : 404).json({
      error: parsed.success ? "Too many refreshes. Try again shortly." : "Inbox not found.",
    });
    return;
  }
  try {
    const session = await getLiveSession(parsed.data.sessionId);
    if (!session) {
      res.status(404).json({ error: "This inbox has expired and was removed." });
      return;
    }
    if (session.status === "active") {
      const remote = await fetchProviderMessages(
        session.providerToken,
        session.providerPassword,
        session.address,
      );
      if (remote.encryptedToken !== session.providerToken) {
        await db
          .update(mailboxSessionsTable)
          .set({ providerToken: remote.encryptedToken })
          .where(eq(mailboxSessionsTable.sessionId, session.sessionId));
      }
      for (const summary of remote.messages) {
        const existing = await db
          .select({ id: mailboxMessagesTable.id })
          .from(mailboxMessagesTable)
          .where(eq(mailboxMessagesTable.id, summary.id))
          .limit(1);
        if (existing[0]) continue;
        const detail = await fetchProviderMessage(remote.encryptedToken, summary.id);
        const htmlBody = sanitizeIncomingHtml(detail?.html);
        const textBody = detail?.text ?? summary.intro ?? "";
        await db.insert(mailboxMessagesTable).values({
          id: summary.id,
          sessionId: session.sessionId,
          senderName: summary.from?.name || summary.from?.address || "Unknown sender",
          senderAddress: summary.from?.address || "",
          subject: summary.subject || "(no subject)",
          preview: summary.intro || textBody.slice(0, 180),
          textBody,
          htmlBody: htmlBody || null,
          receivedAt: new Date(summary.createdAt || Date.now()),
          isRead: Boolean(summary.seen),
        });
      }
    }
    const messages = await db
      .select({
        id: mailboxMessagesTable.id,
        senderName: mailboxMessagesTable.senderName,
        senderAddress: mailboxMessagesTable.senderAddress,
        subject: mailboxMessagesTable.subject,
        preview: mailboxMessagesTable.preview,
        receivedAt: mailboxMessagesTable.receivedAt,
        isRead: mailboxMessagesTable.isRead,
      })
      .from(mailboxMessagesTable)
      .where(eq(mailboxMessagesTable.sessionId, session.sessionId))
      .orderBy(asc(mailboxMessagesTable.receivedAt));
    res.json(messages.map((message) => ({ ...message, receivedAt: message.receivedAt.toISOString() })));
  } catch (error) {
    req.log.error({ err: error }, "Unable to refresh mailbox");
    res.status(502).json({ error: "The provider could not be reached. Your cached messages are safe." });
  }
});

router.get("/sessions/:sessionId/messages/:messageId", async (req, res) => {
  const parsed = GetMessageParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Message not found." });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(mailboxMessagesTable)
      .where(
        and(
          eq(mailboxMessagesTable.id, parsed.data.messageId),
          eq(mailboxMessagesTable.sessionId, parsed.data.sessionId),
        ),
      )
      .limit(1);
    if (!rows[0]) {
      res.status(404).json({ error: "Message not found." });
      return;
    }
    await db
      .update(mailboxMessagesTable)
      .set({ isRead: true })
      .where(eq(mailboxMessagesTable.id, rows[0].id));
    res.json({
      ...rows[0],
      receivedAt: rows[0].receivedAt.toISOString(),
      isRead: true,
    });
  } catch (error) {
    req.log.error({ err: error }, "Unable to load message");
    res.status(500).json({ error: "Unable to load this message." });
  }
});

router.post("/sessions/:sessionId/rotate", async (req, res) => {
  const parsedParams = RotateSessionParams.safeParse(req.params);
  const parsedBody = RotateSessionBody.safeParse(req.body);
  const duration = parsedBody.success ? parseDuration(parsedBody.data.durationSeconds) : null;
  if (!parsedParams.success || !duration) {
    res.status(400).json({ error: "Choose a duration between 1 hour and 7 days." });
    return;
  }
  try {
    const current = await getLiveSession(parsedParams.data.sessionId);
    if (!current) {
      res.status(404).json({ error: "Inbox not found." });
      return;
    }
    await db
      .update(mailboxSessionsTable)
      .set({ status: "archived" })
      .where(eq(mailboxSessionsTable.sessionId, current.sessionId));
    await deleteProviderMailbox(current.providerToken, current.providerAccountId);
    const next = await createSession(duration);
    res.status(201).json(mapSession(next));
  } catch (error) {
    req.log.error({ err: error }, "Unable to rotate mailbox");
    res.status(502).json({ error: "Unable to create a new inbox right now." });
  }
});

export async function runMailboxCleanup() {
  const now = new Date();
  const expired = await db
    .select()
    .from(mailboxSessionsTable)
    .where(and(eq(mailboxSessionsTable.status, "active"), lt(mailboxSessionsTable.expiresAt, now)));
  for (const session of expired) {
    await db
      .update(mailboxSessionsTable)
      .set({ status: "archived" })
      .where(eq(mailboxSessionsTable.sessionId, session.sessionId));
    await deleteProviderMailbox(session.providerToken, session.providerAccountId);
  }
  await db
    .delete(mailboxSessionsTable)
    .where(lt(mailboxSessionsTable.archiveUntil, now));
}

export default router;