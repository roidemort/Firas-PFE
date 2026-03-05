import Redis from 'ioredis'
import { Queue as QueueMQ, Worker } from 'bullmq'

import emailProcess from '../processes/email.process';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const RedisURL = `redis://${REDIS_HOST}:${REDIS_PORT}`

export const redis = new Redis(RedisURL, {
    maxRetriesPerRequest: null,
    password: process.env.REDIS_PASSWORD
})

export const createQueueMQ = (name: string) => new QueueMQ(name, { connection: redis as any });

export async function setupEmailBullMQProcessor(queueName: string) {
    new Worker(
        queueName,
        async (job) => {
            await emailProcess(job.data)
            return { jobId: `This is the return value of job (${job.id})` };
        },
        { connection: redis as any }
    );
}

export const emailBullMq = createQueueMQ('SendMail');