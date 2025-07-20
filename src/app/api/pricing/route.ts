import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { createPricingSchema, pricingFiltersSchema } from '@/lib/validations';
import { SettlementTankPricing } from '@/types/database';

const pricingService = new CrudService<SettlementTankPricing>(
  'settlement_tank_pricing'
);

// GET /api/pricing - List pricing with pagination, search, and filtering
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters including pricing-specific filters
  const { page, limit, settlement_id, container_type_id, is_active, currency } =
    pricingFiltersSchema.parse(Object.fromEntries(searchParams.entries()));

  // Build filters
  const filters: Record<string, any> = {};

  if (settlement_id) filters.settlement_id = settlement_id;
  if (container_type_id) filters.container_type_id = container_type_id;
  if (is_active !== undefined) filters.is_active = is_active;
  if (currency) filters.currency = currency;

  // Get paginated results
  const response = await pricingService.getAll(filters, {
    page,
    limit,
  });

  return response;
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
