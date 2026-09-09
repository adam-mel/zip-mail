# ZipMail

A no-signup temporary mailbox with user-selected expiry and a read-only archive window.

## What it does

Create a disposable email address, receive emails, read them in a clean inbox, and walk away. The address expires on your terms — anywhere from 1 hour to 7 days. Messages are cached in PostgreSQL so you can revisit them for up to 7 days after expiry. No account, no tracking, no fuss.

### Features

- **No signup** — create an inbox in one click
- **Custom expiry** — choose a lifespan from 1 hour to 7 days
- **Message archiving** — cached messages accessible for 7 days after the inbox expires
- **Shareable links** — send your inbox URL to anyone
- **Address rotation** — archive the current inbox and spin up a new one
- **HTML sanitization** — rich emails rendered safely in a sandboxed iframe
- **i18n** — English, French, Spanish, Portuguese, and German
- **Rate limiting** — abuse protection on creation and refresh endpoints

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS, Wouter, TanStack Query |
| API | Express 5, TypeScript, Zod validation |
| Database | PostgreSQL, Drizzle ORM |
| Codegen | Orval (OpenAPI → React hooks + Zod schemas) |
| Build | pnpm workspaces, esbuild, TypeScript 5.9 |

## Project structure

```
├── artifacts/
│   ├── temp-mail-app/      # React frontend (Vite)
│   ├── api-server/          # Express API server
│   └── mockup-sandbox/      # Design preview environment
├── lib/
│   ├── api-spec/            # OpenAPI contract (source of truth)
│   ├── api-client-react/    # Generated React hooks (Orval)
│   ├── api-zod/             # Generated Zod schemas (Orval)
│   └── db/                  # Drizzle schema + migrations
└── scripts/                 # Dev tooling (post-merge, etc.)
```

## Getting started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL

### Setup

```bash
pnpm install
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for AES-256-GCM encryption of provider tokens |
| `PORT` | Server port (e.g. `5000`) |
| `BASE_PATH` | Base URL path for the frontend (e.g. `/`) |

### Development

```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# Typecheck everything
pnpm run typecheck

# Build all packages
pnpm run build
```

### Database

```bash
# Push schema changes (dev only)
pnpm --filter @workspace/db run push
```

### API codegen

```bash
# Regenerate hooks and Zod schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

## Architecture

- A high-entropy app-generated session UUID serves as the shareable access credential. The upstream mail.tm account ID is never exposed.
- Provider tokens and passwords are encrypted at rest using AES-256-GCM derived from `SESSION_SECRET`.
- Message bodies are copied into PostgreSQL before expiry so archive views do not depend on the upstream provider.
- Incoming rich HTML is sanitized server-side and displayed inside a sandboxed iframe; plain text is the default view.
- Inbox refresh is intentionally manual — no background polling.

## License

MIT
