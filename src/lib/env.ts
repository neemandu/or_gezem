import { z } from 'zod';

const envSchema = z.object({
  // Application Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:3000'),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // Database Configuration
  DATABASE_URL: z.string().url('Invalid database URL'),

  // Green API WhatsApp Integration
  GREEN_API_INSTANCE_ID: z.string().min(1, 'Green API instance ID is required'),
  GREEN_API_ACCESS_TOKEN: z
    .string()
    .min(1, 'Green API access token is required'),
  NEXT_PUBLIC_GREEN_API_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('https://api.green-api.com'),

  // Security Keys
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  // Optional configurations
  WEBHOOK_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
});

// Validate environment variables and provide helpful error messages
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors
        .map((err) => {
          return `${err.path.join('.')}: ${err.message}`;
        })
        .join('\n');

      throw new Error(
        `Environment validation failed:\n${formattedErrors}\n\nPlease check your .env.local file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
