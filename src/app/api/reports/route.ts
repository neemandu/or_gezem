import { NextRequest } from 'next/server';
import {
  apiHandler,
  CrudService,
  requireAuth,
  UnauthorizedError,
} from '@/lib/api';
import { createReportSchema, reportFiltersSchema } from '@/lib/validations';
import { Report } from '@/types/api';
import { createClient } from '@/lib/supabase/server';

const reportsService = new CrudService<Report>('reports');

// GET /api/reports - List reports with pagination, search, and role-based filtering
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Authenticate user
  const user = await requireAuth(request);

  // Get user role from user_metadata instead of database
  const userRole = user.user_metadata?.role;
  if (!userRole) {
    throw new UnauthorizedError('לא ניתן לקבוע את תפקיד המשתמש');
  }

  let userSettlementId = null;

  // Only get settlement_id from database if needed for settlement users
  if (userRole === 'SETTLEMENT_USER') {
    const supabase = await createClient();
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('settlement_id')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile) {
      throw new UnauthorizedError('לא ניתן לאמת את פרטי המשתמש');
    }

    userSettlementId = userProfile.settlement_id;
  }

  // Validate query parameters including report-specific filters
  const {
    page,
    limit,
    driver_id,
    tank_id,
    settlement_id,
    report_date_from,
    report_date_to,
  } = reportFiltersSchema.parse(Object.fromEntries(searchParams.entries()));

  // Build filters based on user role
  const filters: Record<string, any> = {};

  // Role-based filtering
  switch (userRole) {
    case 'DRIVER':
      // Drivers can only see their own reports
      filters.driver_id = user.id;
      break;

    case 'SETTLEMENT_USER':
      // Settlement users can only see reports from their settlement
      if (!userSettlementId) {
        throw new UnauthorizedError('משתמש יישוב חייב להיות מקושר ליישוב');
      }
      filters.settlement_id = userSettlementId;
      break;

    case 'ADMIN':
      // Admins can see all reports, apply optional filters
      if (driver_id) filters.driver_id = driver_id;
      if (settlement_id) filters.settlement_id = settlement_id;
      break;

    default:
      throw new UnauthorizedError('תפקיד משתמש לא מוכר');
  }

  const supabase = await createClient();

  // Apply additional filters
  if (tank_id) filters.container_type_id = tank_id; // Map tank_id to container_type_id

  // Build date range query for created_at field
  let dateRangeQuery = supabase
    .from('reports')
    .select(
      `
      *,
      driver:users!driver_id(id, email),
      settlement:settlements(id, name),
      container_type:container_types(id, name, size, unit)
    `
    )
    .match(filters);

  // Apply date range filtering using created_at field
  if (report_date_from) {
    dateRangeQuery = dateRangeQuery.gte(
      'created_at',
      `${report_date_from}T00:00:00Z`
    );
  }
  if (report_date_to) {
    dateRangeQuery = dateRangeQuery.lte(
      'created_at',
      `${report_date_to}T23:59:59Z`
    );
  }

  // Get paginated results with relations
  const { data: reports, error: reportsError } = await dateRangeQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (reportsError) {
    console.error('Error fetching reports:', reportsError);
    return {
      success: false,
      error: 'שגיאה בטעינת הדיווחים',
    };
  }

  // Get total count for pagination with same date filtering
  let countQuery = supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .match(filters);

  // Apply same date range filtering for count
  if (report_date_from) {
    countQuery = countQuery.gte('created_at', `${report_date_from}T00:00:00Z`);
  }
  if (report_date_to) {
    countQuery = countQuery.lte('created_at', `${report_date_to}T23:59:59Z`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error getting reports count:', countError);
  }

  return {
    success: true,
    data: reports || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
});

// POST /api/reports - Create new report with automatic pricing calculation
export const POST = apiHandler(async (request: NextRequest) => {
  // Authenticate user
  const user = await requireAuth(request);

  console.log('user', user);

  if (!user) {
    throw new UnauthorizedError('לא ניתן לאמת את פרטי המשתמש');
  }

  // Only drivers can create reports - check user_metadata instead of database
  if (user.user_metadata?.role !== 'DRIVER') {
    throw new UnauthorizedError('רק נהגים יכולים ליצור דיווחים');
  }

  // Validate request body
  const body = await request.json();

  // Ensure driver_id matches authenticated user
  const reportData = {
    ...body,
    driver_id: user.id, // Override with authenticated user ID
  };

  const validatedData = createReportSchema.parse(reportData);

  const supabase = await createClient();

  // Create report
  const { data: newReport, error: createError } = await supabase
    .from('reports')
    .insert(validatedData)
    .select(
      `
      *,
      driver:users!driver_id(id, email),
      settlement:settlements(id, name),
      container_type:container_types(id, name, size, unit)
    `
    )
    .single();

  if (createError) {
    console.error('Error creating report:', createError);
    return {
      success: false,
      error: 'שגיאה ביצירת הדיווח',
    };
  }

  return {
    success: true,
    data: newReport,
    message: 'דיווח נוצר בהצלחה',
  };
});
