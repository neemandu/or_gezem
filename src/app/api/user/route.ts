import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiHandler, requireAuth } from '@/lib/api';

export const GET = apiHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const supabase = await createClient();

  // Get user details with settlement information
  const { data: userDetails, error } = await supabase
    .from('users')
    .select(
      `
      id,
      email,
      role,
      first_name,
      last_name,
      phone,
      settlement_id,
      settlements (
        id,
        name,
        contact_phone,
        contact_person
      )
    `
    )
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user details: ${error.message}`);
  }

  return {
    success: true,
    data: userDetails,
  };
});
