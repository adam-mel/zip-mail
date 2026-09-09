import app from "./app";
import { logger } from "./lib/logger";
import { runMailboxCleanup } from "./routes/sessions";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  void runMailboxCleanup().catch((cleanupError) => {
    logger.error({ err: cleanupError }, "Initial mailbox cleanup failed");
  });
  setInterval(() => {
    void runMailboxCleanup().catch((cleanupError) => {
      logger.error({ err: cleanupError }, "Mailbox cleanup failed");
    });
  }, 5 * 60 * 1000);
});
