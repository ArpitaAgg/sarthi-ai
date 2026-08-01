import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/AppError';
import { redisClient } from '../config/redis';
import { UserPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-access-token-key-saarthi-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-saarthi-2026';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  private generateTokens(user: { id: string; email: string; role: Role }) {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });

    return { accessToken, refreshToken };
  }

  async register(data: { name: string; email: string; password: string; role?: Role }) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || Role.USER,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.create(user.id, tokens.refreshToken, expiresAt);

    // Cache session in Redis for fast access
    await redisClient.setex(`session:${user.id}`, 900, JSON.stringify({ id: user.id, email: user.email, role: user.role }));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new BadRequestError('Refresh token is required');
    }

    const storedToken = await this.refreshTokenRepository.findByToken(token);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as UserPayload;
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Rotate tokens
      await this.refreshTokenRepository.deleteByToken(token);
      const newTokens = this.generateTokens(user);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.refreshTokenRepository.create(user.id, newTokens.refreshToken, expiresAt);

      return newTokens;
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(token?: string, userId?: string) {
    if (token) {
      await this.refreshTokenRepository.deleteByToken(token);
    }
    if (userId) {
      await redisClient.del(`session:${userId}`);
    }
  }

  async getCurrentUser(userId: string) {
    // Check Redis cache first
    const cachedUser = await redisClient.get(`session:${userId}`);
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      const user = await this.userRepository.findById(userId);
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        };
      }
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
