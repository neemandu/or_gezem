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
    // Note: This is a simple implementation. For proper full-text search,
    // you might want to use Supabase's text search functions
    filters.name = search; // This would need to be enhanced for proper search
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
