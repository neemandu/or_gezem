-- Row Level Security (RLS) Policies for Hebrew Green Waste Management System
-- Description: Implements role-based access control for all tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_tank_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ====================================
-- HELPER FUNCTIONS FOR RLS
-- ====================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's settlement_id
CREATE OR REPLACE FUNCTION get_user_settlement_id(user_email TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT settlement_id FROM users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_email) = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is driver
CREATE OR REPLACE FUNCTION is_driver(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_email) = 'DRIVER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is settlement user
CREATE OR REPLACE FUNCTION is_settlement_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_email) = 'SETTLEMENT_USER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- USERS TABLE POLICIES
-- ====================================

-- ADMIN: Full access to all users
CREATE POLICY "admin_users_all" ON users
FOR ALL USING (is_admin(auth.email()));

-- SETTLEMENT_USER: Can view their own profile and other users from same settlement
CREATE POLICY "settlement_user_users_select" ON users
FOR SELECT USING (
    is_settlement_user(auth.email()) AND (
        email = auth.email() OR -- Own profile
        (settlement_id = get_user_settlement_id(auth.email()) AND settlement_id IS NOT NULL) -- Same settlement
    )
);

-- SETTLEMENT_USER: Can update their own profile only
CREATE POLICY "settlement_user_users_update" ON users
FOR UPDATE USING (
    is_settlement_user(auth.email()) AND email = auth.email()
);

-- DRIVER: Can view and update their own profile only
CREATE POLICY "driver_users_select" ON users
FOR SELECT USING (
    is_driver(auth.email()) AND email = auth.email()
);

CREATE POLICY "driver_users_update" ON users
FOR UPDATE USING (
    is_driver(auth.email()) AND email = auth.email()
);

-- INSERT: Only admins can create new users
CREATE POLICY "admin_users_insert" ON users
FOR INSERT WITH CHECK (is_admin(auth.email()));

-- DELETE: Only admins can delete users
CREATE POLICY "admin_users_delete" ON users
FOR DELETE USING (is_admin(auth.email()));

-- ====================================
-- SETTLEMENTS TABLE POLICIES
-- ====================================

-- ADMIN: Full access to all settlements
CREATE POLICY "admin_settlements_all" ON settlements
FOR ALL USING (is_admin(auth.email()));

-- SETTLEMENT_USER: Can view their own settlement only
CREATE POLICY "settlement_user_settlements_select" ON settlements
FOR SELECT USING (
    is_settlement_user(auth.email()) AND 
    id = get_user_settlement_id(auth.email())
);

-- SETTLEMENT_USER: Can update their own settlement
CREATE POLICY "settlement_user_settlements_update" ON settlements
FOR UPDATE USING (
    is_settlement_user(auth.email()) AND 
    id = get_user_settlement_id(auth.email())
);

-- DRIVER: Can view all settlements (needed for creating reports)
CREATE POLICY "driver_settlements_select" ON settlements
FOR SELECT USING (is_driver(auth.email()));

-- ====================================
-- CONTAINER_TYPES TABLE POLICIES
-- ====================================

-- ADMIN: Full access to container types
CREATE POLICY "admin_container_types_all" ON container_types
FOR ALL USING (is_admin(auth.email()));

-- SETTLEMENT_USER and DRIVER: Can view all container types (read-only)
CREATE POLICY "users_container_types_select" ON container_types
FOR SELECT USING (
    is_settlement_user(auth.email()) OR is_driver(auth.email())
);

-- ====================================
-- SETTLEMENT_TANK_PRICING TABLE POLICIES
-- ====================================

-- ADMIN: Full access to all pricing
CREATE POLICY "admin_pricing_all" ON settlement_tank_pricing
FOR ALL USING (is_admin(auth.email()));

-- SETTLEMENT_USER: Can view and manage pricing for their settlement
CREATE POLICY "settlement_user_pricing_select" ON settlement_tank_pricing
FOR SELECT USING (
    is_settlement_user(auth.email()) AND 
    settlement_id = get_user_settlement_id(auth.email())
);

CREATE POLICY "settlement_user_pricing_insert" ON settlement_tank_pricing
FOR INSERT WITH CHECK (
    is_settlement_user(auth.email()) AND 
    settlement_id = get_user_settlement_id(auth.email())
);

CREATE POLICY "settlement_user_pricing_update" ON settlement_tank_pricing
FOR UPDATE USING (
    is_settlement_user(auth.email()) AND 
    settlement_id = get_user_settlement_id(auth.email())
);

CREATE POLICY "settlement_user_pricing_delete" ON settlement_tank_pricing
FOR DELETE USING (
    is_settlement_user(auth.email()) AND 
    settlement_id = get_user_settlement_id(auth.email())
);

-- DRIVER: Can view pricing for all settlements (needed for calculating report prices)
CREATE POLICY "driver_pricing_select" ON settlement_tank_pricing
FOR SELECT USING (is_driver(auth.email()));

-- ====================================
-- REPORTS TABLE POLICIES
-- ====================================

-- ADMIN: Full access to all reports
CREATE POLICY "admin_reports_all" ON reports
FOR ALL USING (is_admin(auth.email()));

-- SETTLEMENT_USER: Can view reports for their settlement
CREATE POLICY "settlement_user_reports_select" ON reports
FOR SELECT USING (
    is_settlement_user(auth.email()) AND 
    settlement_id = get_user_settlement_id(auth.email())
);

-- DRIVER: Can view their own reports and create new reports
CREATE POLICY "driver_reports_select" ON reports
FOR SELECT USING (
    is_driver(auth.email()) AND 
    driver_id = (SELECT id FROM users WHERE email = auth.email())
);

CREATE POLICY "driver_reports_insert" ON reports
FOR INSERT WITH CHECK (
    is_driver(auth.email()) AND 
    driver_id = (SELECT id FROM users WHERE email = auth.email())
);

-- DRIVER: Can update their own reports (within 24 hours of creation)
CREATE POLICY "driver_reports_update" ON reports
FOR UPDATE USING (
    is_driver(auth.email()) AND 
    driver_id = (SELECT id FROM users WHERE email = auth.email()) AND
    created_at > (now() - INTERVAL '24 hours')
);

-- ====================================
-- NOTIFICATIONS TABLE POLICIES
-- ====================================

-- ADMIN: Full access to all notifications
CREATE POLICY "admin_notifications_all" ON notifications
FOR ALL USING (is_admin(auth.email()));

-- SETTLEMENT_USER: Can view notifications for reports from their settlement
CREATE POLICY "settlement_user_notifications_select" ON notifications
FOR SELECT USING (
    is_settlement_user(auth.email()) AND 
    report_id IN (
        SELECT id FROM reports 
        WHERE settlement_id = get_user_settlement_id(auth.email())
    )
);

-- DRIVER: Can view notifications for their own reports
CREATE POLICY "driver_notifications_select" ON notifications
FOR SELECT USING (
    is_driver(auth.email()) AND 
    report_id IN (
        SELECT id FROM reports 
        WHERE driver_id = (SELECT id FROM users WHERE email = auth.email())
    )
);

-- System can create notifications (for automated processes)
CREATE POLICY "system_notifications_insert" ON notifications
FOR INSERT WITH CHECK (true);

-- System can update notification status (for delivery confirmations)
CREATE POLICY "system_notifications_update" ON notifications
FOR UPDATE USING (true);

-- ====================================
-- ADDITIONAL SECURITY CONSTRAINTS
-- ====================================

-- Users can update their own profile (role modification prevention handled by trigger)
CREATE POLICY "users_self_update" ON users
FOR UPDATE USING (
    is_admin(auth.email()) OR email = auth.email()
) WITH CHECK (
    is_admin(auth.email()) OR email = auth.email()
);

-- Prevent drivers from modifying settlement_id in reports after creation
-- Note: Settlement modification prevention handled by trigger in initial_schema.sql

-- ====================================
-- GRANT PERMISSIONS
-- ====================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on custom functions
GRANT EXECUTE ON FUNCTION get_user_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_settlement_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_driver(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_settlement_user(TEXT) TO authenticated;

-- ====================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON FUNCTION get_user_role(TEXT) IS 'Returns the role of a user by email';
COMMENT ON FUNCTION get_user_settlement_id(TEXT) IS 'Returns the settlement_id of a user by email';
COMMENT ON FUNCTION is_admin(TEXT) IS 'Checks if user has ADMIN role';
COMMENT ON FUNCTION is_driver(TEXT) IS 'Checks if user has DRIVER role';
COMMENT ON FUNCTION is_settlement_user(TEXT) IS 'Checks if user has SETTLEMENT_USER role'; 