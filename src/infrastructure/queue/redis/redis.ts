import Redis from 'ioredis';
import { config } from "../../../shared/config";

export const redis = new Redis({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD,
});

export const publishToQueue = async (channel: string, message: string) => {
  await redis.publish(channel, message);
};