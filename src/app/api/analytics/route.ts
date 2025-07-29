import { NextRequest } from 'next/server';
import { apiHandler, requireAuth } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics - Get dashboard analytics data
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  // Authenticate user
  const user = await requireAuth(request);
  const userRole = user.user_metadata?.role;

  if (!userRole) {
    return {
      success: false,
      error: 'לא ניתן לקבוע את תפקיד המשתמש',
    };
  }

  const supabase = await createClient();

  // Get user settlement ID if needed
  let userSettlementId = null;
  if (userRole === 'SETTLEMENT_USER') {
    const { data: userProfile } = await supabase
      .from('users')
      .select('settlement_id')
      .eq('id', user.id)
      .single();

    userSettlementId = userProfile?.settlement_id;
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build base filters based on user role
  let baseFilters: any = {};

  if (userRole === 'DRIVER') {
    baseFilters.driver_id = user.id;
  } else if (userRole === 'SETTLEMENT_USER' && userSettlementId) {
    baseFilters.settlement_id = userSettlementId;
  }
  // ADMIN can see all data, no filters needed

  try {
    // Get total reports count
    let reportsQuery = supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (userRole === 'DRIVER') {
      reportsQuery = reportsQuery.eq('driver_id', user.id);
    } else if (userRole === 'SETTLEMENT_USER' && userSettlementId) {
      reportsQuery = reportsQuery.eq('settlement_id', userSettlementId);
    }

    const { count: totalReports } = await reportsQuery;

    // Get today's reports count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayQuery = supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (userRole === 'DRIVER') {
      todayQuery = todayQuery.eq('driver_id', user.id);
    } else if (userRole === 'SETTLEMENT_USER' && userSettlementId) {
      todayQuery = todayQuery.eq('settlement_id', userSettlementId);
    }

    const { count: todayReports } = await todayQuery;

    // Get total volume and revenue
    let volumeQuery = supabase
      .from('reports')
      .select('volume, total_price, currency');

    if (userRole === 'DRIVER') {
      volumeQuery = volumeQuery.eq('driver_id', user.id);
    } else if (userRole === 'SETTLEMENT_USER' && userSettlementId) {
      volumeQuery = volumeQuery.eq('settlement_id', userSettlementId);
    }

    const { data: volumeData } = await volumeQuery;

    const totalVolume =
      volumeData?.reduce((sum, report) => sum + (report.volume || 0), 0) || 0;
    const totalRevenue =
      volumeData?.reduce((sum, report) => sum + (report.total_price || 0), 0) ||
      0;

    // Get notifications count (if user has access)
    let notificationsCount = 0;
    if (userRole === 'ADMIN') {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });
      notificationsCount = count || 0;
    }

    // Get settlements count (admin only)
    let settlementsCount = 0;
    if (userRole === 'ADMIN') {
      const { count } = await supabase
        .from('settlements')
        .select('*', { count: 'exact', head: true });
      settlementsCount = count || 0;
    }

    // Get drivers count (admin only)
    let driversCount = 0;
    if (userRole === 'ADMIN') {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'DRIVER');
      driversCount = count || 0;
    }

    // Get container types count (admin only)
    let containerTypesCount = 0;
    if (userRole === 'ADMIN') {
      const { count } = await supabase
        .from('container_types')
        .select('*', { count: 'exact', head: true });
      containerTypesCount = count || 0;
    }

    // Get monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      let monthQuery = supabase
        .from('reports')
        .select('volume, total_price')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (userRole === 'DRIVER') {
        monthQuery = monthQuery.eq('driver_id', user.id);
      } else if (userRole === 'SETTLEMENT_USER' && userSettlementId) {
        monthQuery = monthQuery.eq('settlement_id', userSettlementId);
      }

      const { data: monthReports } = await monthQuery;

      const monthVolume =
        monthReports?.reduce((sum, report) => sum + (report.volume || 0), 0) ||
        0;
      const monthRevenue =
        monthReports?.reduce(
          (sum, report) => sum + (report.total_price || 0),
          0
        ) || 0;
      const monthCount = monthReports?.length || 0;

      monthlyData.push({
        month: monthStart.toLocaleDateString('he-IL', {
          month: 'long',
          year: 'numeric',
        }),
        count: monthCount,
        volume: monthVolume,
        revenue: monthRevenue,
      });
    }

    // Get top settlements (admin only)
    let topSettlements = [];
    if (userRole === 'ADMIN') {
      const { data: settlementStats } = await supabase
        .from('reports')
        .select(
          `
          settlement_id,
          settlement:settlements(id, name),
          volume,
          total_price
        `
        )
        .not('settlement_id', 'is', null);

      const settlementMap = new Map();
      settlementStats?.forEach((report: any) => {
        const settlementId = report.settlement_id;
        if (!settlementMap.has(settlementId)) {
          settlementMap.set(settlementId, {
            settlement_id: settlementId,
            settlement_name: report.settlement?.name || 'Unknown',
            reports_count: 0,
            total_volume: 0,
            total_revenue: 0,
          });
        }

        const settlement = settlementMap.get(settlementId);
        settlement.reports_count++;
        settlement.total_volume += report.volume || 0;
        settlement.total_revenue += report.total_price || 0;
      });

      topSettlements = Array.from(settlementMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
    }

    // Get top drivers (admin only)
    let topDrivers = [];
    if (userRole === 'ADMIN') {
      const { data: driverStats } = await supabase
        .from('reports')
        .select(
          `
          driver_id,
          driver:users!driver_id(id, email),
          volume,
          total_price
        `
        )
        .not('driver_id', 'is', null);

      const driverMap = new Map();
      driverStats?.forEach((report: any) => {
        const driverId = report.driver_id;
        if (!driverMap.has(driverId)) {
          driverMap.set(driverId, {
            driver_id: driverId,
            driver_name: report.driver?.email || 'Unknown',
            reports_count: 0,
            total_volume: 0,
          });
        }

        const driver = driverMap.get(driverId);
        driver.reports_count++;
        driver.total_volume += report.volume || 0;
      });

      topDrivers = Array.from(driverMap.values())
        .sort((a, b) => b.reports_count - a.reports_count)
        .slice(0, 5);
    }

    // Get container type stats (admin only)
    let containerTypeStats = [];
    if (userRole === 'ADMIN') {
      const { data: containerStats } = await supabase
        .from('reports')
        .select(
          `
          container_type_id,
          container_type:container_types(id, name, size, unit),
          volume,
          total_price
        `
        )
        .not('container_type_id', 'is', null);

      const containerMap = new Map();
      containerStats?.forEach((report: any) => {
        const containerTypeId = report.container_type_id;
        if (!containerMap.has(containerTypeId)) {
          containerMap.set(containerTypeId, {
            container_type_id: containerTypeId,
            container_type_name: report.container_type?.name || 'Unknown',
            usage_count: 0,
            total_volume: 0,
          });
        }

        const container = containerMap.get(containerTypeId);
        container.usage_count++;
        container.total_volume += report.volume || 0;
      });

      containerTypeStats = Array.from(containerMap.values()).sort(
        (a, b) => b.usage_count - a.usage_count
      );
    }

    return {
      success: true,
      data: {
        totalReports: totalReports || 0,
        todayReports: todayReports || 0,
        totalVolume,
        totalRevenue,
        totalNotifications: notificationsCount,
        settlementsCount,
        driversCount,
        containerTypesCount,
        reportsByMonth: monthlyData,
        topSettlements,
        topDrivers,
        containerTypeStats,
      },
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      success: false,
      error: 'שגיאה בטעינת נתוני האנליטיקה',
    };
  }
});
