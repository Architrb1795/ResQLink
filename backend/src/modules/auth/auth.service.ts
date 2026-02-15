import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../services/db';
import { env } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.schema';
import { auditService } from '../audit/audit.service';

// ─── Auth Service ─────────────────────────────────────────────
// Handles user registration, login, token refresh, and logout.
// Uses JWT for access tokens and opaque refresh tokens stored in DB.
// ──────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

/**
 * Parse a duration string like '15m', '1h', '7d' into seconds.
 */
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900; // default 15 minutes
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 900;
  }
}

function generateAccessToken(userId: string, role: string): string {
  const expiresIn = parseDurationToSeconds(env.JWT_EXPIRES_IN);
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn });
}

async function generateRefreshToken(userId: string): Promise<string> {
  const token = uuidv4();

  // Store hashed refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return token;
}

export const authService = {
  async register(input: RegisterInput) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    // Audit log
    await auditService.writeLog(user.id, 'USER_REGISTERED', 'User', user.id);

    return { user, accessToken, refreshToken };
  },

  async login(input: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    // Verify password
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    // Audit log
    await auditService.writeLog(user.id, 'USER_LOGIN', 'User', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    // Find the refresh token in DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    // Revoke old token (rotation)
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    // Generate new pair
    const accessToken = generateAccessToken(stored.user.id, stored.user.role);
    const newRefreshToken = await generateRefreshToken(stored.user.id);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    // Revoke the refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  },
};
