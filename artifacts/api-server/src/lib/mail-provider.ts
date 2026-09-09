import crypto from "node:crypto";

const MAIL_API = "https://api.mail.tm";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set for mailbox credential encryption.");
}

const encryptionKey = crypto
  .createHash("sha256")
  .update(SESSION_SECRET)
  .digest();

export type ProviderMessage = {
  id: string;
  from?: { name?: string; address?: string };
  subject?: string;
  intro?: string;
  createdAt?: string;
  seen?: boolean;
  text?: string;
  html?: string | string[];
};

type ProviderResponse<T> = {
  response: Response;
  data: T;
};

function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decrypt(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Invalid encrypted value.");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(ivText, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ProviderResponse<T>> {
  const response = await fetch(`${MAIL_API}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const text = await response.text();
  let data: T;
  try {
    data = (text ? JSON.parse(text) : {}) as T;
  } catch {
    data = {} as T;
  }
  return { response, data };
}

function randomPassword() {
  return crypto.randomBytes(24).toString("base64url");
}

function randomLocalPart() {
  return `quiet-${crypto.randomBytes(8).toString("hex")}`;
}

export async function createProviderMailbox() {
  const domains = await request<
    Array<{ domain: string; isActive?: boolean }> | { "hydra:member"?: Array<{ domain: string; isActive?: boolean }> }
  >(
    "/domains?page=1",
  );
  if (!domains.response.ok) {
    throw new Error(`mail.tm domain lookup failed (${domains.response.status}).`);
  }

  const domainList = Array.isArray(domains.data) ? domains.data : (domains.data["hydra:member"] ?? []);
  const domain = domainList.find((item) => item.isActive !== false)?.domain;
  if (!domain) throw new Error("mail.tm returned no active domains.");

  const address = `${randomLocalPart()}@${domain}`;
  const password = randomPassword();
  const account = await request<{ id?: string }>("/accounts", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  if (!account.response.ok || !account.data.id) {
    throw new Error(`mail.tm mailbox creation failed (${account.response.status}).`);
  }

  const token = await request<{ token?: string }>("/token", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  if (!token.response.ok || !token.data.token) {
    throw new Error(`mail.tm token creation failed (${token.response.status}).`);
  }

  return {
    address,
    providerAccountId: account.data.id,
    providerToken: encrypt(token.data.token),
    providerPassword: encrypt(password),
  };
}

export async function fetchProviderMessages(
  encryptedToken: string,
  encryptedPassword: string,
  address: string,
) {
  let token = decrypt(encryptedToken);
  let result = await request<ProviderMessage[] | { "hydra:member"?: ProviderMessage[] }>("/messages?page=1", {
    headers: { authorization: `Bearer ${token}` },
  });

  if (result.response.status === 401) {
    const refreshed = await request<{ token?: string }>("/token", {
      method: "POST",
      body: JSON.stringify({ address, password: decrypt(encryptedPassword) }),
    });
    if (!refreshed.response.ok || !refreshed.data.token) {
      throw new Error("mail.tm authentication expired and could not be renewed.");
    }
    token = refreshed.data.token;
    result = await request<ProviderMessage[] | { "hydra:member"?: ProviderMessage[] }>("/messages?page=1", {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!result.response.ok) throw new Error(`mail.tm message refresh failed (${result.response.status}).`);
    const messages = Array.isArray(result.data) ? result.data : (result.data["hydra:member"] ?? []);
    return { messages, encryptedToken: encrypt(token) };
  }

  if (!result.response.ok) throw new Error(`mail.tm message refresh failed (${result.response.status}).`);
  const messages = Array.isArray(result.data) ? result.data : (result.data["hydra:member"] ?? []);
  return { messages, encryptedToken: encryptedToken };
}

export async function fetchProviderMessage(token: string, messageId: string) {
  const result = await request<ProviderMessage>(`/messages/${encodeURIComponent(messageId)}`, {
    headers: { authorization: `Bearer ${decrypt(token)}` },
  });
  if (!result.response.ok) return null;
  return result.data;
}

export async function deleteProviderMailbox(encryptedToken: string, accountId: string) {
  try {
    const result = await request(`/accounts/${encodeURIComponent(accountId)}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${decrypt(encryptedToken)}` },
    });
    return result.response.ok || result.response.status === 404;
  } catch {
    return false;
  }
}

export function sanitizeIncomingHtml(value: string | string[] | null | undefined) {
  const html = Array.isArray(value) ? value.join("") : value ?? "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|form|base|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|form|base|meta|link)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
}
