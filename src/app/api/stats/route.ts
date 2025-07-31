import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

interface QuickStats {
  settlementsCount: number;
  driversCount: number;
  tanksCount: number;
}

// GET /api/stats - Get quick stats for dashboard
export const GET = apiHandler(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Get settlements count
    const { count: settlementsCount, error: settlementsError } = await supabase
      .from('settlements')
      .select('*', { count: 'exact', head: true });

    if (settlementsError) {
      throw new Error(
        `Failed to fetch settlements count: ${settlementsError.message}`
      );
    }

    // Get drivers count (users with DRIVER role)
    const { count: driversCount, error: driversError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'DRIVER');

    if (driversError) {
      throw new Error(`Failed to fetch drivers count: ${driversError.message}`);
    }

    // Get tanks count
    const { count: tanksCount, error: tanksError } = await supabase
      .from('container_types')
      .select('*', { count: 'exact', head: true });

    if (tanksError) {
      throw new Error(`Failed to fetch tanks count: ${tanksError.message}`);
    }

    const stats: QuickStats = {
      settlementsCount: settlementsCount || 0,
      driversCount: driversCount || 0,
      tanksCount: tanksCount || 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch stats: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
