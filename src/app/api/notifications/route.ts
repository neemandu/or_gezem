import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiHandler, requireAuth, parsePagination } from '@/lib/api';

export const GET = apiHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);

  // Get filters from query params
  const settlement_id = searchParams.get('settlement_id') || '';
  const status = searchParams.get('status') || '';
  const date_from = searchParams.get('date_from') || '';
  const date_to = searchParams.get('date_to') || '';
  const search = searchParams.get('search') || '';

  let query = supabase.from('notifications').select(
    `
      *,
      report:reports (
        id,
        settlement_id,
        driver_id,
        volume,
        total_price,
        currency,
        settlement:settlements (
          id,
          name
        ),
        driver:users (
          id,
          email,
          first_name,
          last_name
        )
      )
    `,
    { count: 'exact' }
  );

  // Apply filters based on user role
  if (user.user_metadata?.role === 'SETTLEMENT_USER') {
    // Settlement users can only see notifications for their settlement
    query = query.eq('report.settlement_id', user.user_metadata?.settlement_id);
  } else if (user.user_metadata?.role === 'DRIVER') {
    // Drivers can only see their own notifications
    query = query.eq('report.driver_id', user.id);
  }

  // Apply additional filters
  if (settlement_id) {
    query = query.eq('report.settlement_id', settlement_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (date_from) {
    query = query.gte('created_at', date_from);
  }

  if (date_to) {
    query = query.lte('created_at', date_to);
  }

  if (search) {
    query = query.or(
      `message.ilike.%${search}%,report.settlement.name.ilike.%${search}%,report.driver.email.ilike.%${search}%`
    );
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  // Order by created_at descending
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return {
    success: true,
    data: data || [],
    total: count || 0,
    page,
    limit,
  };
});
