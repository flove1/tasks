import server from "@infrastructure/http/server";
import { logger } from "@shared/logger";

try {
  const instance = server.start();

  const shutdown = async () => {
    logger.info(`signal received. shutting down...`);

    setTimeout(() => {
      logger.error("timeout, forcing shutdown...");
      process.exit(1);
    }, 10000).unref();

    await instance?.stop();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  logger.error(`failed to start server: ${JSON.stringify(error)}`);
  process.exit(1);
}