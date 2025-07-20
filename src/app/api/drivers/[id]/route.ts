import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { updateDriverSchema, parseAndValidateId } from '@/lib/validations';
import { Driver } from '@/types/api';

const driversService = new CrudService<Driver>('users');

// GET /api/drivers/[id] - Get driver by ID
export const GET = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await driversService.getById(validatedId);
    return response;
  }
);

// PUT /api/drivers/[id] - Update driver
export const PUT = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    // Validate request body
    const body = await request.json();
    const validatedData = updateDriverSchema.parse(body);

    const response = await driversService.update(validatedId, validatedData);
    return response;
  }
);

// DELETE /api/drivers/[id] - Delete driver
export const DELETE = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await driversService.delete(validatedId);
    return response;
  }
);
