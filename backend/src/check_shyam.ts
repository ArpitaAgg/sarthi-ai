import { prisma } from './config/prisma';

async function check() {
  const shyamTasks = await prisma.task.findMany({
    where: {
      title: { contains: 'shyam', mode: 'insensitive' },
    },
  });

  console.log('--- TASK SHYAM DETAILS ---');
  console.log(JSON.stringify(shyamTasks, null, 2));

  process.exit(0);
}

check().catch(console.error);
