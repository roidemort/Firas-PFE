import { createClient } from 'redis';
import logger from "./logger";

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const RedisURL = `redis://${REDIS_HOST}:${REDIS_PORT}/0`

const client =  createClient({ url: RedisURL, password: process.env.REDIS_PASSWORD });

export const connectRedis = async () => {
  client.on('error', (err) => logger.error('Redis Client Error', err));
  client.on('connect', () => { logger.info('✅ 💃 Connect redis success !') })
  client.on('ready', () => { logger.info('✅ 💃 Redis have ready !') })

  await client.connect();
}
global.ClientRedis = client
