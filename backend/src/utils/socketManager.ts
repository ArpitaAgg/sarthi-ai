import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger';
import { UserPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-access-token-key-saarthi-2026';

export class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(httpServer: HttpServer): SocketIOServer {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Authentication middleware for WebSockets
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        // Allow connection even without token, but restrict private rooms
        return next();
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        (socket as any).user = decoded;
        next();
      } catch (err) {
        logger.warn('Socket connection token verification failed:', err);
        next();
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as UserPayload | undefined;
      logger.info(`🔌 Socket connected: ${socket.id} (User: ${user ? user.email : 'Anonymous'})`);

      if (user) {
        socket.join(`user:${user.id}`);
        if (user.role === 'ADMIN') {
          socket.join('admin');
        }
      }

      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    logger.info('✅ Socket.IO server initialized successfully');
    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.IO not initialized');
    }
    return this.io;
  }

  public emitToUser(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).to('admin').emit(event, payload);
    }
  }

  public emitToAll(event: string, payload: any) {
    if (this.io) {
      this.io.emit(event, payload);
    }
  }

  public emitToAdmin(event: string, payload: any) {
    if (this.io) {
      this.io.to('admin').emit(event, payload);
    }
  }
}
