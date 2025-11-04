import Redis from "ioredis";
import { config } from "../../../shared/config";
import { logger } from "@shared/logger";

const redis = new Redis({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD,
  maxRetriesPerRequest: 3,
  family: 4,
  retryStrategy: (times) => {
    const base = Math.min(1000 * 2 ** Math.max(times - 1, 0), 30000);
    const jitter = Math.floor(base * 0.2 * Math.random());
    return base + jitter;
  },
  showFriendlyErrorStack: true,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error("redis error: " + err.message);
});

export const publishToQueue = async (channel: string, message: string) => {
  await redis.publish(channel, message);
};

export { redis };
