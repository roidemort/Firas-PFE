import Redis from 'ioredis'
import { Queue as QueueMQ, Worker } from 'bullmq'

import emailProcess from '../processes/email.process';

const RedisURL = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`

export const redis = new Redis(RedisURL, {
  maxRetriesPerRequest: null,
  password: process.env.REDIS_PASSWORD
})

export const createQueueMQ = (name: string) => new QueueMQ(name, { connection: redis });

export async function setupEmailBullMQProcessor(queueName: string) {
    new Worker(
        queueName,
        async (job) => {
            emailProcess(job.data)
            return { jobId: `This is the return value of job (${job.id})` };
        },
        { connection: redis }
    );
}

export const emailBullMq = createQueueMQ('SendMail');