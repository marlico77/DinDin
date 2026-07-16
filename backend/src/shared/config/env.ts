import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT Secret for authentication
  JWT_SECRET: z.string().min(10).default('default_jwt_secret_change_me_in_production'),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(process.env.NODE_ENV === 'development' ? 500 : 100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // Swagger Documentation
  SWAGGER_USERNAME: z.string().optional(),
  SWAGGER_PASSWORD: z.string().optional(),

  // First run
  FIRST_RUN: z.coerce.boolean().optional(),
  
  // CORS
  ALLOWED_ORIGINS: z.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    const fieldErrors = parsed.error.flatten().fieldErrors;
    console.error(JSON.stringify(fieldErrors, null, 2));
    console.error('\n📝 Missing or invalid variables:');
    Object.entries(fieldErrors).forEach(([field, errors]) => {
      console.error(`  - ${field}: ${errors?.join(', ') || 'invalid'}`);
    });
    console.error('\n💡 Please check your environment variables configuration.');
    process.exit(1);
  }

  const env = parsed.data;

  if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'default_jwt_secret_change_me_in_production') {
    console.warn('⚠️  WARNING: You are using the default JWT_SECRET in production. This is highly insecure!');
  }

  return env;
}

export const env = validateEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';



