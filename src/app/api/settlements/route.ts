import { NextRequest } from 'next/server';
import { apiHandler, CrudService, parsePagination } from '@/lib/api';
import { createSettlementSchema, queryParamsSchema } from '@/lib/validations';
import { Settlement } from '@/types/api';

const settlementsService = new CrudService<Settlement>('settlements');

// GET /api/settlements - List settlements with pagination and search
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const { page, limit, search, sort, order } = queryParamsSchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  // Build filters
  const filters: Record<string, any> = {};

  // Add search functionality
  if (search) {
    // For now, we'll use a simple ILIKE search on the name field
    // In a production environment, you might want to use Supabase's full-text search
    filters.name = search;
  }

  // Get paginated results
  const response = await settlementsService.getAll(filters, { page, limit });

  return response;
});

// POST /api/settlements - Create new settlement
export const POST = apiHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await request.json();
  const validatedData = createSettlementSchema.parse(body);

  // Create settlement
  const response = await settlementsService.create(validatedData);

  return response;
});
