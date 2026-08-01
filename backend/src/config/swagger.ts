export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Saarthi TaskEngine API Documentation',
    version: '1.0.0',
    description: 'Interactive Swagger OpenAPI documentation for Saarthi TaskEngine REST API.',
    contact: {
      name: 'Saarthi AI Support',
      email: 'support@saarthi.ai',
    },
  },
  servers: [
    {
      url: 'https://saarthi-backend-api-1sm4.onrender.com',
      description: 'Production Live Render Server',
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token obtained from /api/auth/login',
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Demo User' },
                  email: { type: 'string', example: 'demo@saarthi.ai' },
                  password: { type: 'string', example: 'UserPassword123!' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation failed' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login and acquire JWT Access & Refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@saarthi.ai' },
                  password: { type: 'string', example: 'UserPassword123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful, returns JWT tokens' },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token and issue new access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'New access token issued' },
          '401': { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Authenticated user profile data' },
          '401': { description: 'Unauthorized access' },
        },
      },
    },
    '/api/tasks': {
      post: {
        tags: ['Tasks Engine'],
        summary: 'Enqueue a new task into BullMQ Redis Queue',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Swagger Test Task' },
                  description: { type: 'string', example: 'Enqueued from Swagger UI' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'HIGH' },
                  type: { type: 'string', example: 'DATA_PROCESSING' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Task created and queued successfully' },
        },
      },
      get: {
        tags: ['Tasks Engine'],
        summary: 'List user tasks with filters & pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] } },
        ],
        responses: {
          '200': { description: 'Paginated list of tasks' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks Engine'],
        summary: 'Get task details & execution output',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Task details and execution JSON output' },
          '404': { description: 'Task not found' },
        },
      },
      delete: {
        tags: ['Tasks Engine'],
        summary: 'Delete a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Task deleted successfully' },
        },
      },
    },
    '/api/tasks/{id}/retry': {
      post: {
        tags: ['Tasks Engine'],
        summary: 'Re-enqueue a task to BullMQ Redis Queue',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Task re-queued successfully' },
        },
      },
    },
    '/api/dashboard/stats': {
      get: {
        tags: ['Dashboard Telemetry'],
        summary: 'Get live task counts & Redis queue metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Live telemetry metrics' },
        },
      },
    },
  },
};
