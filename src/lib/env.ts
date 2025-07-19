import { z } from 'zod';

const envSchema = z.object({
  // Application Environment
  NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'production', 'test']),
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
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // Database Configuration
  NEXT_PUBLIC_DATABASE_URL: z.string().url('Invalid database URL'),

  // Green API WhatsApp Integration
  // NEXT_PUBLIC_GREEN_API_INSTANCE_ID: z
  //   .string()
  //   .min(1, 'Green API instance ID is required')
  //   .optional(),
  // NEXT_PUBLIC_GREEN_API_ACCESS_TOKEN: z
  //   .string()
  //   .min(1, 'Green API access token is required')
  //   .optional(),
  // NEXT_PUBLIC_GREEN_API_BASE_URL: z
  //   .string()
  //   .url()
  //   .optional()
  //   .default('https://api.green-api.com'),

  // Optional configurations
  NEXT_PUBLIC_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_ENCRYPTION_KEY: z.string().optional(),
});

// Validate environment variables and provide helpful error messages
function validateEnv() {
  try {
    const env = {
      NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_DATABASE_URL: process.env.NEXT_PUBLIC_DATABASE_URL,
    };
    return envSchema.parse(env);
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
export const isProduction = env.NEXT_PUBLIC_NODE_ENV === 'production';
export const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === 'development';
export const isTest = env.NEXT_PUBLIC_NODE_ENV === 'test';
