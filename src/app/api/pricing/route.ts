import { NextRequest } from 'next/server';
import {
  apiHandler,
  CrudService,
  ApiError,
  paginatedResponse,
} from '@/lib/api';
import { createPricingSchema, pricingFiltersSchema } from '@/lib/validations';
import { SettlementTankPricing } from '@/types/database';
import { createClient } from '@/lib/supabase/server';

const pricingService = new CrudService<SettlementTankPricing>(
  'settlement_tank_pricing'
);

// GET /api/pricing - List pricing with pagination, search, and filtering
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters including pricing-specific filters
  const { page, limit, settlement_id, container_type_id, is_active, currency } =
    pricingFiltersSchema.parse(Object.fromEntries(searchParams.entries()));

  const supabase = await createClient();

  // Build the query with joins
  let query = supabase.from('settlement_tank_pricing').select(
    `
      *,
      settlement:settlement_id(id, name),
      container_type:container_type_id(id, name, size, unit)
    `,
    { count: 'exact' }
  );

  // Apply filters
  if (settlement_id) query = query.eq('settlement_id', settlement_id);
  if (container_type_id)
    query = query.eq('container_type_id', container_type_id);
  if (is_active !== undefined) query = query.eq('is_active', is_active);
  if (currency) query = query.eq('currency', currency);

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new ApiError(`Failed to fetch pricing: ${error.message}`);
  }

  return paginatedResponse(data as any[], page, limit, count || 0);
});

// POST /api/pricing - Create new pricing
export const POST = apiHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await request.json();
  const validatedData = createPricingSchema.parse(body);

  // Check for existing active pricing for same settlement + container type
  const existingPricing = await pricingService.getAll({
    settlement_id: validatedData.settlement_id,
    container_type_id: validatedData.container_type_id,
    is_active: true,
  });

  if (
    existingPricing.success &&
    existingPricing.data &&
    existingPricing.data.length > 0
  ) {
    return {
      success: false,
      error: 'כבר קיים תמחור פעיל עבור יישוב וסוג מכל זה',
    };
  }

  // Create pricing
  const response = await pricingService.create(validatedData);

  return response;
});
