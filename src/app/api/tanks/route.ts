import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { createTankSchema, queryParamsSchema } from '@/lib/validations';
import { ContainerType } from '@/types/api';

const tanksService = new CrudService<ContainerType>('container_types');

// GET /api/tanks - List container types with pagination and search
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const { page, limit, search } = queryParamsSchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  // Build filters
  const filters: Record<string, any> = {};

  // Add search functionality for container names
  if (search) {
    filters.name = search;
  }

  // Get paginated results
  const response = await tanksService.getAll(filters, { page, limit });

  return response;
});

// POST /api/tanks - Create new container type
export const POST = apiHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await request.json();

  console.log('body', body);
  const validatedData = createTankSchema.parse(body);

  // Create container type
  const response = await tanksService.create(validatedData);

  return response;
});
