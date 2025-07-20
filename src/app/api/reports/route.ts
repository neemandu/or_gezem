import { NextRequest } from 'next/server';
import { apiHandler, CrudService } from '@/lib/api';
import { createReportSchema, reportFiltersSchema } from '@/lib/validations';
import { Report } from '@/types/api';
import { calculateTotalPrice } from '@/lib/pricing-utils';

const reportsService = new CrudService<Report>('reports');

// GET /api/reports - List reports with pagination, search, and filtering
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters including report-specific filters
  const {
    page,
    limit,
    driver_id,
    tank_id,
    settlement_id,
    report_date_from,
    report_date_to,
    waste_type,
    condition,
  } = reportFiltersSchema.parse(Object.fromEntries(searchParams.entries()));

  // Build filters
  const filters: Record<string, any> = {};

  if (driver_id) filters.driver_id = driver_id;
  if (tank_id) filters.container_type_id = tank_id; // Map tank_id to container_type_id
  if (settlement_id) filters.settlement_id = settlement_id;
  if (waste_type) filters.waste_type = waste_type;
  if (condition) filters.condition = condition;

  // Date range filtering would need to be handled differently in Supabase
  // This is a simplified version - in production, you'd use proper date range queries
  if (report_date_from) {
    // You would use .gte() in Supabase query
    filters.report_date = report_date_from;
  }

  // Get paginated results
  const response = await reportsService.getAll(filters, { page, limit });

  return response;
});

// POST /api/reports - Create new report
export const POST = apiHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await request.json();
  const validatedData = createReportSchema.parse(body);

  // Automatically calculate pricing if not provided
  if (!validatedData.unit_price || !validatedData.total_price) {
    const pricingResult = await calculateTotalPrice(
      validatedData.settlement_id,
      validatedData.container_type_id,
      validatedData.volume
    );

    if (!pricingResult.success) {
      return {
        success: false,
        error: `שגיאה בחישוב מחיר: ${pricingResult.error}`,
      };
    }

    // Update validated data with calculated pricing
    validatedData.unit_price = pricingResult.data!.unit_price;
    validatedData.total_price = pricingResult.data!.total_price;
    validatedData.currency = pricingResult.data!.currency;
  }

  // Create report with pricing
  const response = await reportsService.create(validatedData);

  return response;
});
