import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, InvalidTokenError, EmailNotVerifiedError } from '../errors/index.js';
import { env } from '../config/env.js';

/**
 * Authenticated user context injected into requests
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Extend Fastify request to include auth user
 */
declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

/**
 * Authentication middleware
 * Verifies JWT token and injects authUser into request
 */
export function authMiddleware(options: { requireEmailVerified?: boolean } = {}) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Extract token from header
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedError('Bearer token required');
    }

    // Verify token with jsonwebtoken
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      request.log.warn({ error }, 'Token verification failed');
      throw new InvalidTokenError();
    }

    // Validate email is present (required for user creation)
    if (!decodedToken.email || !decodedToken.id) {
      throw new UnauthorizedError('Invalid token payload');
    }

    // Inject auth user into request
    request.authUser = {
      id: decodedToken.id,
      email: decodedToken.email,
    };
  };
}

/**
 * Get authenticated user from request
 * Throws if user is not authenticated
 */
export function getAuthUser(request: FastifyRequest): AuthUser {
  if (!request.authUser) {
    throw new UnauthorizedError('Authentication required');
  }
  return request.authUser;
}







