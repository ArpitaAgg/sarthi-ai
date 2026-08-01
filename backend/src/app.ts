import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middlewares/errorMiddleware';
import { NotFoundError } from './utils/AppError';

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'];

// Security and utility middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root landing endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'Saarthi TaskEngine API',
    version: '1.0.0',
    status: 'ONLINE',
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

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
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
