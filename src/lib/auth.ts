import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-secret-key-that-is-long-enough',
);

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'diretor';
  is_active: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'diretor';
  password_change_required?: boolean;
  [key: string]: unknown; // Add index signature to fix type compatibility
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload & { password_change_required?: boolean }): Promise<string> {
  const tokenPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    password_change_required: payload.password_change_required || false
  };
  
  return new jose.SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Também verifica cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

export function requireAuth(allowedRoles: ('admin' | 'user' | 'diretor')[] = ['admin', 'user', 'diretor']) {
  return async (request: NextRequest) => {
    const token = getTokenFromRequest(request);
    if (!token) {
      return { error: 'Token não fornecido', status: 401 };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { error: 'Token inválido', status: 401 };
    }

    if (!allowedRoles.includes(payload.role)) {
      return { error: 'Permissão insuficiente', status: 403 };
    }

    return { user: payload };
  };
}