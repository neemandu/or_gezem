import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { updateReportSchema, parseAndValidateId } from '@/lib/validations';
import { Report } from '@/types/api';

const reportsService = new CrudService<Report>('reports');

// GET /api/reports/[id] - Get report by ID
export const GET = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    const response = await reportsService.getById(validatedId);
    return response;
  }
);

// PUT /api/reports/[id] - Update report
export const PUT = apiHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const validatedId = parseAndValidateId({ id });

    // Validate request body
    const body = await request.json();
    const validatedData = updateReportSchema.parse(body);

    const response = await reportsService.update(validatedId, validatedData);
    return response;
  }
);

// Note: DELETE is typically not supported for reports as they are historical records
// If deletion is needed, you might want to add a "deleted" flag instead
