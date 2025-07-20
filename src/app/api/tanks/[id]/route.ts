import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { updateTankSchema, parseAndValidateId } from '@/lib/validations';
import { ContainerType } from '@/types/api';

const tanksService = new CrudService<ContainerType>('container_types');

// GET /api/tanks/[id] - Get container type by ID
export const GET = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await tanksService.getById(validatedId);
    return response;
  }
);

// PUT /api/tanks/[id] - Update container type
export const PUT = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    // Validate request body
    const body = await request.json();
    const validatedData = updateTankSchema.parse(body);

    const response = await tanksService.update(validatedId, validatedData);
    return response;
  }
);

// DELETE /api/tanks/[id] - Delete container type
export const DELETE = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await tanksService.delete(validatedId);
    return response;
  }
);
