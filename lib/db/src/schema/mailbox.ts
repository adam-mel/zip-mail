import { createInsertSchema } from "drizzle-zod";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const mailboxSessionsTable = pgTable(
  "mailbox_sessions",
  {
    sessionId: text("session_id").primaryKey(),
    address: text("address").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    providerToken: text("provider_token").notNull(),
    providerPassword: text("provider_password").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    selectedDurationSeconds: text("selected_duration_seconds").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    archiveUntil: timestamp("archive_until", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("active"),
  },
  (table) => [
    index("mailbox_sessions_status_idx").on(table.status),
    index("mailbox_sessions_expires_at_idx").on(table.expiresAt),
    index("mailbox_sessions_archive_until_idx").on(table.archiveUntil),
  ],
);

export const mailboxMessagesTable = pgTable(
  "mailbox_messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => mailboxSessionsTable.sessionId, { onDelete: "cascade" }),
    senderName: text("sender_name").notNull(),
    senderAddress: text("sender_address").notNull(),
    subject: text("subject").notNull(),
    preview: text("preview").notNull(),
    textBody: text("text_body").notNull(),
    htmlBody: text("html_body"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    isRead: boolean("is_read").notNull().default(false),
  },
  (table) => [index("mailbox_messages_session_idx").on(table.sessionId)],
);

export const insertMailboxSessionSchema = createInsertSchema(
  mailboxSessionsTable,
).omit({
  createdAt: true,
});

export const insertMailboxMessageSchema = createInsertSchema(
  mailboxMessagesTable,
);

export type MailboxSession = typeof mailboxSessionsTable.$inferSelect;
export type InsertMailboxSession = z.infer<typeof insertMailboxSessionSchema>;
export type MailboxMessage = typeof mailboxMessagesTable.$inferSelect;
export type InsertMailboxMessage = z.infer<typeof insertMailboxMessageSchema>;