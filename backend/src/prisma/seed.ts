import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const userPassword = await bcrypt.hash('UserPassword123!', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@saarthi.ai',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Demo Developer',
      email: 'user@saarthi.ai',
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log(`✅ Admin created: ${admin.email} (Password: AdminPassword123!)`);
  console.log(`✅ User created: ${user.email} (Password: UserPassword123!)`);

  // Create sample tasks for Demo Developer
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Monthly Financial Data Aggregation',
        description: 'Aggregate Q3 financial data and calculate metrics.',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        type: 'DATA_PROCESSING',
        completedAt: new Date(),
        result: JSON.stringify({ processedRows: 14500, status: 'Success', executionTimeMs: 1240 }),
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Export PDF Analytics Report',
        description: 'Generate comprehensive PDF report for management review.',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        type: 'REPORT_GENERATION',
        completedAt: new Date(),
        result: JSON.stringify({ fileGenerated: 'report_2026.pdf', pageCount: 12 }),
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Batch Image Processing & Compression',
        description: 'Compress product catalog images to WebP format.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.URGENT,
        type: 'FILE_PROCESSING',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Third-party API Webhook Sync',
        description: 'Fetch latest telemetry data from partner API.',
        status: TaskStatus.FAILED,
        priority: TaskPriority.LOW,
        type: 'GENERAL',
        failedAt: new Date(),
        errorMessage: 'Connection timeout after 30000ms from upstream server',
        retryCount: 2,
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Scheduled System Backup',
        description: 'Perform nightly database dump and sync to cold storage.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        type: 'DATA_EXPORT',
        scheduledAt: new Date(Date.now() + 3600000 * 24), // Scheduled for tomorrow
        userId: admin.id,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} sample tasks.`);

  // Enqueue seeded pending tasks into BullMQ queue
  try {
    const { addTaskToQueue } = await import('../queues/taskQueue');
    for (const t of tasks) {
      if (t.status === TaskStatus.PENDING) {
        let delayMs: number | undefined = undefined;
        if (t.scheduledAt && t.scheduledAt > new Date()) {
          delayMs = t.scheduledAt.getTime() - Date.now();
        }
        await addTaskToQueue(t.id, t.userId, t.type, t.priority, delayMs).catch(() => {});
      }
    }
    console.log('✅ Enqueued seeded PENDING tasks into BullMQ Redis Queue.');
  } catch (e) {
    console.log('ℹ️ BullMQ enqueue skipped during offline seed run.');
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
