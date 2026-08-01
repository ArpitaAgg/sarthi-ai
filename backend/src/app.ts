import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middlewares/errorMiddleware';
import { NotFoundError } from './utils/AppError';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Reflect origin to support all clients (Vercel, Localhost, Mobile, Postman)
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Security and utility middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger UI Interactive API Documentation
app.use(['/docs', '/api/docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root landing & health endpoints
app.get(['/', '/health', '/api'], (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'Saarthi TaskEngine API',
    version: '1.0.0',
    status: 'ONLINE',
    message: 'Saarthi TaskEngine REST API server is live and accepting connections.',
    documentation: 'See README.md & postman_collection.json',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refreshToken: 'POST /api/auth/refresh-token',
        me: 'GET /api/auth/me (Bearer Token required)',
      },
      tasks: {
        list: 'GET /api/tasks (Bearer Token required)',
        create: 'POST /api/tasks (Bearer Token required)',
        getById: 'GET /api/tasks/:id (Bearer Token required)',
        retry: 'POST /api/tasks/:id/retry (Bearer Token required)',
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats (Bearer Token required)',
      },
    },
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((_req: Request, _res: Response, next) => {
  next(new NotFoundError('Route not found'));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
