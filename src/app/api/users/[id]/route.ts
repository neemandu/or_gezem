import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiHandler, requireAuth } from '@/lib/api';

export const PATCH = apiHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireAuth(request);
    const supabase = await createClient();

    // Only allow users to update their own profile
    if (user.id !== params.id) {
      throw new Error('Unauthorized: Can only update own profile');
    }

    const body = await request.json();
    const { first_name, last_name, phone } = body;

    // Validate input
    if (first_name && typeof first_name !== 'string') {
      throw new Error('Invalid first_name');
    }
    if (last_name && typeof last_name !== 'string') {
      throw new Error('Invalid last_name');
    }
    if (phone && typeof phone !== 'string') {
      throw new Error('Invalid phone');
    }

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return {
      success: true,
      data,
      message: 'User profile updated successfully',
    };
  }
);

export const GET = apiHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireAuth(request);
    const supabase = await createClient();

    // Only allow users to view their own profile
    if (user.id !== params.id) {
      throw new Error('Unauthorized: Can only view own profile');
    }

    const { data, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return {
      success: true,
      data,
    };
  }
);
