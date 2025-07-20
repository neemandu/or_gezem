import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { createDriverSchema, queryParamsSchema } from '@/lib/validations';
import {
  createAuthUser,
  generatePassword,
  getUserWithMetadata,
} from '@/lib/admin-utils';
import { Driver } from '@/types/api';
import { createClient } from '@/lib/supabase/server';

const driversService = new CrudService<Driver>('users');

// GET /api/drivers - List drivers with pagination and search including metadata
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const { page, limit, search } = queryParamsSchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  // Build filters - always filter by DRIVER role
  const filters: Record<string, any> = {
    role: 'DRIVER',
  };

  // Add search functionality for driver email
  if (search) {
    filters.email = search;
  }

  // Get paginated results from database
  const driversResponse = await driversService.getAll(filters, { page, limit });

  if (!driversResponse.success || !driversResponse.data) {
    return driversResponse;
  }

  // Enhance with user metadata from Supabase Auth
  const enhancedDrivers = await Promise.all(
    driversResponse.data.map(async (driver) => {
      try {
        const metadataResult = await getUserWithMetadata(driver.id);
        if (metadataResult.success && metadataResult.data) {
          return {
            ...driver,
            user_metadata: metadataResult.data.user_metadata || {},
          };
        }
        return {
          ...driver,
          user_metadata: {},
        };
      } catch (error) {
        console.warn(
          `Failed to fetch metadata for driver ${driver.id}:`,
          error
        );
        return {
          ...driver,
          user_metadata: {},
        };
      }
    })
  );

  return {
    ...driversResponse,
    data: enhancedDrivers,
  };
});

// POST /api/drivers - Create new driver with Supabase Auth
export const POST = apiHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await request.json();
  const validatedData = createDriverSchema.parse(body);

  // Generate a secure password or use provided one
  const password = validatedData.password || generatePassword(12);

  // Prepare driver data for auth creation
  const driverData = {
    email: validatedData.email,
    password,
    role: 'DRIVER' as const,
    name:
      validatedData.first_name && validatedData.last_name
        ? `${validatedData.first_name} ${validatedData.last_name}`
        : undefined,
    settlement_id: null, // Drivers don't belong to specific settlements
    // phone: validatedData.phone,
    first_name: validatedData.first_name,
    last_name: validatedData.last_name,
  };

  // Create driver with auth
  const result = await createAuthUser(driverData);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  // Return success with login credentials
  return {
    success: true,
    data: {
      ...result.data,
      // Include password in response for admin to share with driver
      // In production, you might want to send this via email instead
      temporary_password: password,
    },
    message: `נהג נוצר בהצלחה. פרטי התחברות: ${validatedData.email} / ${password}`,
  };
});
