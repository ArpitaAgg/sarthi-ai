import { prisma } from './config/prisma';
import { getQueueMetrics, taskQueue } from './queues/taskQueue';

async function check() {
  const pendingTasks = await prisma.task.findMany({
    where: { status: 'PENDING' },
  });

  console.log('--- DATABASE PENDING TASKS ---');
  console.log(JSON.stringify(pendingTasks, null, 2));

  const metrics = await getQueueMetrics();
  console.log('--- REDIS QUEUE METRICS ---');
  console.log(JSON.stringify(metrics, null, 2));

  process.exit(0);
}

check().catch(console.error);
