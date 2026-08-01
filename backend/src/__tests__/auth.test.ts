import request from 'supertest';
import app from '../app';

describe('Auth Endpoints Integration Tests', () => {
  const testUser = {
    name: 'Test Runner',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
  };

  let refreshToken = '';

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should fail registration with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');

    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('should refresh tokens using valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });
});
