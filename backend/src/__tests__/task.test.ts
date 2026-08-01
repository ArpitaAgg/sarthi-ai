import request from 'supertest';
import app from '../app';

describe('Task API Endpoints & Unit Tests', () => {
  jest.setTimeout(30000);
  let authToken = '';
  let createdTaskId = '';

  const testUser = {
    name: 'Task Tester',
    email: `task-tester-${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    // Register and login to retrieve JWT token
    await request(app).post('/api/auth/register').send(testUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    authToken = loginRes.body.data.tokens.accessToken;
  });

  it('should create and enqueue a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Jest Unit Test Task',
        description: 'Testing task creation endpoint',
        priority: 'HIGH',
        type: 'DATA_PROCESSING',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Jest Unit Test Task');
    expect(res.body.data.status).toBe('PENDING');

    createdTaskId = res.body.data.id;
  });

  it('should fetch list of user tasks with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('should fetch a single task by ID', async () => {
    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  it('should fail task creation when required title is missing (Validation test)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Missing title',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
