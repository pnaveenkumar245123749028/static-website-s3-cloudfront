import { Queue, Worker } from 'bullmq';
import { getRedisClient, getIsRedisAvailable } from '../config/queue.js';
import { orchestrator } from '../agents/orchestrator.js';

let bullQueue = null;
let bullWorker = null;

// Built-in In-Memory async job runner fallback
class InMemoryQueue {
  async add(name, data, opts = {}) {
    setTimeout(async () => {
      try {
        await orchestrator.run(data.executionId, data.userId);
      } catch (err) {
        console.error('[In-Memory Queue] Execution error:', err);
      }
    }, opts.delay || 10);
    return { id: `in_mem_${Date.now()}` };
  }
}

const inMemoryQueue = new InMemoryQueue();

export function initExecutionQueue() {
  const redis = getRedisClient();
  const isRedis = getIsRedisAvailable();

  if (isRedis && redis) {
    try {
      bullQueue = new Queue('workflow-executions', {
        connection: redis,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1500,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      bullWorker = new Worker(
        'workflow-executions',
        async (job) => {
          const { executionId, userId } = job.data;
          await orchestrator.run(executionId, userId);
        },
        { connection: redis, concurrency: 5 }
      );

      bullWorker.on('completed', (job) => {
        console.log(`[BullMQ Worker] Job ${job.id} (Execution ${job.data.executionId}) completed.`);
      });

      bullWorker.on('failed', (job, err) => {
        console.error(`[BullMQ Worker] Job ${job.id} failed:`, err.message);
      });

      console.log('[ExecutionQueue] Initialized with BullMQ on Redis.');
      return;
    } catch (err) {
      console.warn('[ExecutionQueue] BullMQ init failed, using in-memory queue:', err.message);
    }
  }

  console.log('[ExecutionQueue] Initialized with In-Memory background job dispatcher.');
}

export async function enqueueExecution(executionId, userId, options = {}) {
  if (bullQueue && getIsRedisAvailable()) {
    return bullQueue.add('execute-workflow', { executionId, userId }, options);
  }
  return inMemoryQueue.add('execute-workflow', { executionId, userId }, options);
}
