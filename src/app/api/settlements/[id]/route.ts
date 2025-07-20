import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { updateSettlementSchema, parseAndValidateId } from '@/lib/validations';
import { Settlement } from '@/types/api';

const settlementsService = new CrudService<Settlement>('settlements');

// GET /api/settlements/[id] - Get settlement by ID
export const GET = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await settlementsService.getById(validatedId);
    return response;
  }
);

// PUT /api/settlements/[id] - Update settlement
export const PUT = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    // Validate request body
    const body = await request.json();
    const validatedData = updateSettlementSchema.parse(body);

    const response = await settlementsService.update(
      validatedId,
      validatedData
    );
    return response;
  }
);

// DELETE /api/settlements/[id] - Delete settlement
export const DELETE = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await settlementsService.delete(validatedId);
    return response;
  }
);
