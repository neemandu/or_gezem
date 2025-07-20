import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { updatePricingSchema, parseAndValidateId } from '@/lib/validations';
import { SettlementTankPricing } from '@/types/database';

const pricingService = new CrudService<SettlementTankPricing>(
  'settlement_tank_pricing'
);

// GET /api/pricing/[id] - Get pricing by ID
export const GET = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await pricingService.getById(validatedId);
    return response;
  }
);

// PUT /api/pricing/[id] - Update pricing
export const PUT = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    // Validate request body
    const body = await request.json();
    const validatedData = updatePricingSchema.parse(body);

    // If updating settlement_id or container_type_id, check for existing active pricing
    if (validatedData.settlement_id || validatedData.container_type_id) {
      const currentPricing = await pricingService.getById(validatedId);

      if (currentPricing.success && currentPricing.data) {
        const settlementId =
          validatedData.settlement_id || currentPricing.data.settlement_id;
        const containerTypeId =
          validatedData.container_type_id ||
          currentPricing.data.container_type_id;

        // Check for existing active pricing (excluding current record)
        const existingPricing = await pricingService.getAll({
          settlement_id: settlementId,
          container_type_id: containerTypeId,
          is_active: true,
        });

        if (
          existingPricing.success &&
          existingPricing.data &&
          existingPricing.data.some((pricing) => pricing.id !== validatedId)
        ) {
          return {
            success: false,
            error: 'כבר קיים תמחור פעיל עבור יישוב וסוג מכל זה',
          };
        }
      }
    }

    const response = await pricingService.update(validatedId, validatedData);
    return response;
  }
);

// DELETE /api/pricing/[id] - Delete pricing
export const DELETE = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await pricingService.delete(validatedId);
    return response;
  }
);
