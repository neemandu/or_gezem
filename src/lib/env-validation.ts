import { env, isDevelopment, isProduction } from './env';
import { validateGreenApiConfig } from './green-api';
import { checkSupabaseConnection } from './supabase';
import { checkGreenApiConnection } from './green-api';
import type { IntegrationError } from '../types/integrations';

// Validation result types
interface ValidationResult {
  service: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface HealthCheckResult {
  service: string;
  connected: boolean;
  status?: string;
  error?: IntegrationError;
}

interface SystemValidationResult {
  allValid: boolean;
  validations: ValidationResult[];
  healthChecks: HealthCheckResult[];
  summary: {
    totalServices: number;
    validServices: number;
    connectedServices: number;
    criticalErrors: number;
    warnings: number;
  };
}

// Core validation functions
function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_NODE_ENV',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_DATABASE_URL',
  ];

  // Check for missing required variables
  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Validate specific formats
  if (
    env.NEXT_PUBLIC_SUPABASE_URL &&
    !env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')
  ) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  if (
    env.NEXT_PUBLIC_DATABASE_URL &&
    !env.NEXT_PUBLIC_DATABASE_URL.startsWith('postgresql://')
  ) {
    errors.push(
      'NEXT_PUBLIC_DATABASE_URL must be a valid PostgreSQL connection string'
    );
  }

  return {
    service: 'Environment Variables',
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateSupabaseConfig(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic URL validation
    if (env.NEXT_PUBLIC_SUPABASE_URL) {
      const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
      if (!url.hostname.includes('supabase')) {
        warnings.push(
          'Supabase URL does not appear to be a standard Supabase domain'
        );
      }
    }

    // Key format validation (basic check)
    if (
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 100
    ) {
      warnings.push('Supabase anon key appears to be too short');
    }

    if (
      env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY &&
      env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY.length < 100
    ) {
      warnings.push('Supabase service role key appears to be too short');
    }

    // Check if keys are the same (common mistake)
    if (
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ===
      env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    ) {
      errors.push('Supabase anon key and service role key should be different');
    }
  } catch (error) {
    errors.push(
      `Supabase configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return {
    service: 'Supabase Configuration',
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Health check functions
async function performHealthChecks(): Promise<HealthCheckResult[]> {
  const healthChecks: Promise<HealthCheckResult>[] = [
    checkSupabaseHealth(),
    checkGreenApiHealth(),
  ];

  const results = await Promise.allSettled(healthChecks);

  return results.map((result, index) => {
    const serviceNames = ['Supabase', 'Green API'];
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        service: serviceNames[index],
        connected: false,
        error: {
          service: serviceNames[index].toLowerCase() as any,
          code: 'HEALTH_CHECK_FAILED',
          message: result.reason?.message || 'Health check failed',
          details: result.reason,
        },
      };
    }
  });
}

async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  try {
    const result = await checkSupabaseConnection();
    return {
      service: 'Supabase',
      connected: result.success,
      error: result.success ? undefined : (result.error ?? undefined),
    };
  } catch (error) {
    return {
      service: 'Supabase',
      connected: false,
      error: {
        service: 'supabase',
        code: 'CONNECTION_ERROR',
        message: error instanceof Error ? error.message : 'Connection failed',
        details: error,
      },
    };
  }
}

async function checkGreenApiHealth(): Promise<HealthCheckResult> {
  try {
    const result = await checkGreenApiConnection();
    return {
      service: 'Green API',
      connected: result.success ? (result.data?.connected ?? false) : false,
      status: result.success ? result.data?.status : undefined,
      error: result.success ? undefined : result.error,
    };
  } catch (error) {
    return {
      service: 'Green API',
      connected: false,
      error: {
        service: 'green-api',
        code: 'CONNECTION_ERROR',
        message: error instanceof Error ? error.message : 'Connection failed',
        details: error,
      },
    };
  }
}

// Main validation function
export async function validateSystemConfiguration(): Promise<SystemValidationResult> {
  console.log('🔍 Validating system configuration...');

  // Perform all validations
  const validations: ValidationResult[] = [
    validateEnvironmentVariables(),
    validateSupabaseConfig(),
    { service: 'Green API', ...validateGreenApiConfig(), warnings: [] },
  ];

  // Perform health checks
  const healthChecks = await performHealthChecks();

  // Calculate summary
  const validServices = validations.filter((v) => v.valid).length;
  const connectedServices = healthChecks.filter((h) => h.connected).length;
  const criticalErrors = validations.reduce(
    (acc, v) => acc + v.errors.length,
    0
  );
  const warnings = validations.reduce((acc, v) => acc + v.warnings.length, 0);

  const allValid = validServices === validations.length;

  const result: SystemValidationResult = {
    allValid,
    validations,
    healthChecks,
    summary: {
      totalServices: validations.length,
      validServices,
      connectedServices,
      criticalErrors,
      warnings,
    },
  };

  // Log results
  logValidationResults(result);

  return result;
}

// Validation for specific services
export function validateSupabaseOnly(): ValidationResult {
  return validateSupabaseConfig();
}

export function validateGreenApiOnly(): ValidationResult {
  const result = validateGreenApiConfig();
  return {
    service: 'Green API',
    valid: result.valid,
    errors: result.errors,
    warnings: [],
  };
}

// Quick validation (without health checks)
export function validateConfigurationSync(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const validations = [
    validateEnvironmentVariables(),
    validateSupabaseConfig(),
    {
      service: 'Green API',
      ...validateGreenApiConfig(),
      warnings: [] as string[],
    },
  ];

  const allErrors = validations.flatMap((v) => v.errors);
  const allWarnings = validations.flatMap((v) => v.warnings);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// Logging functions
function logValidationResults(result: SystemValidationResult): void {
  const { summary, validations, healthChecks } = result;

  console.log('\n📊 Validation Summary:');
  console.log(
    `✅ Valid configurations: ${summary.validServices}/${summary.totalServices}`
  );
  console.log(
    `🔗 Connected services: ${summary.connectedServices}/${summary.totalServices}`
  );

  if (summary.criticalErrors > 0) {
    console.log(`❌ Critical errors: ${summary.criticalErrors}`);
  }

  if (summary.warnings > 0) {
    console.log(`⚠️  Warnings: ${summary.warnings}`);
  }

  // Log detailed results
  validations.forEach((validation) => {
    const icon = validation.valid ? '✅' : '❌';
    console.log(`\n${icon} ${validation.service}:`);

    if (validation.errors.length > 0) {
      validation.errors.forEach((error) => console.log(`  ❌ ${error}`));
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => console.log(`  ⚠️  ${warning}`));
    }

    if (
      validation.valid &&
      validation.errors.length === 0 &&
      validation.warnings.length === 0
    ) {
      console.log('  ✅ Configuration is valid');
    }
  });

  console.log('\n🔗 Health Checks:');
  healthChecks.forEach((check) => {
    const icon = check.connected ? '✅' : '❌';
    const status = check.status ? ` (${check.status})` : '';
    console.log(`${icon} ${check.service}${status}`);

    if (check.error) {
      console.log(`  ❌ ${check.error.message}`);
    }
  });

  if (result.allValid && summary.connectedServices === summary.totalServices) {
    console.log('\n🎉 All systems operational!');
  } else if (summary.criticalErrors > 0) {
    console.log(
      '\n🚨 Critical configuration errors detected. Please fix before starting the application.'
    );
  } else {
    console.log('\n⚠️  Some issues detected. Check the warnings above.');
  }
}

// Startup validation
export async function validateOnStartup(): Promise<void> {
  const result = await validateSystemConfiguration();

  if (!result.allValid) {
    const criticalErrors = result.validations.flatMap((v) => v.errors);
    if (criticalErrors.length > 0) {
      console.error('\n🚨 Critical configuration errors detected:');
      criticalErrors.forEach((error) => console.error(`  ❌ ${error}`));
      console.error(
        '\nApplication cannot start with these errors. Please check your environment configuration.\n'
      );

      if (isProduction) {
        process.exit(1);
      }
    }
  }
}

// Export individual validators for specific use cases
export {
  validateEnvironmentVariables,
  validateSupabaseConfig,
  performHealthChecks,
  checkSupabaseHealth,
  checkGreenApiHealth,
};

// Default export
export default {
  validateSystemConfiguration,
  validateConfigurationSync,
  validateOnStartup,
  validateSupabaseOnly,
  validateGreenApiOnly,
};
