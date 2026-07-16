import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware, getAuthUser } from '../../shared/middleware/auth.middleware.js';
import { getUserById, getUserHouseholds } from '../../shared/middleware/authorization.middleware.js';
import { isProduction, env } from '../../shared/config/env.js';
import { getOrCreatePersonalHousehold } from '../households/households.service.js';
import { processReferralCode } from '../users/referrals.service.js';
import { prisma } from '../../shared/db/prisma.js';

export async function authRoutes(app: FastifyInstance) {
  /**
   * POST /auth/register
   * Creates a new user
   */
  app.post(
    '/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            referralCode: { type: 'string', maxLength: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password, referralCode } = request.body as any;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.status(400).send({ success: false, error: 'Email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      if (referralCode) {
        try {
          await processReferralCode(referralCode, user.id);
        } catch (error) {
          if (!isProduction) console.error('[Referral] Error:', error);
        }
      }

      const household = await getOrCreatePersonalHousehold(user.id, user.email);

      const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            householdId: household.id,
          },
        },
      });
    }
  );

  /**
   * POST /auth/login
   * Authenticate a user
   */
  app.post(
    '/login',
    {
      schema: {
        description: 'Login an existing user',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as any;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(401).send({ success: false, error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return reply.status(401).send({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
      
      const household = await getOrCreatePersonalHousehold(user.id, user.email);

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            householdId: household.id,
          },
        },
      });
    }
  );

  /**
   * GET /auth/me
   * Get current user info
   */
  app.get(
    '/me',
    {
      schema: {
        description: 'Get current authenticated user info',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  createdAt: { type: 'string', format: 'date-time' },
                  households: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                        joinedAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                      additionalProperties: true,
                    },
                  },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      preHandler: authMiddleware(),
    },
    async (request, reply) => {
      const authUser = getAuthUser(request);
      const user = await getUserById(authUser.id);
      const households = await getUserHouseholds(user.id);

      return reply.send({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          households,
        },
      });
    }
  );
}






