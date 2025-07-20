-- Update RLS Policies to use user_metadata for role checking
-- Description: Updates all RLS helper functions and policies to check user roles from Supabase Auth user_metadata instead of local users table

-- ====================================
-- UPDATED HELPER FUNCTIONS FOR RLS
-- ====================================

-- Function to get current user's role from user_metadata
CREATE OR REPLACE FUNCTION get_user_role_from_metadata()
RETURNS TEXT AS $$
BEGIN
    RETURN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's settlement_id from local users table
CREATE OR REPLACE FUNCTION get_user_settlement_id_from_local()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT settlement_id FROM users WHERE email = auth.email() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin from user_metadata
CREATE OR REPLACE FUNCTION is_admin_from_metadata()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role_from_metadata() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is driver from user_metadata
CREATE OR REPLACE FUNCTION is_driver_from_metadata()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role_from_metadata() = 'DRIVER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is settlement user from user_metadata
CREATE OR REPLACE FUNCTION is_settlement_user_from_metadata()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role_from_metadata() = 'SETTLEMENT_USER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- DROP OLD POLICIES
-- ====================================

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_users_all" ON users;
DROP POLICY IF EXISTS "settlement_user_users_select" ON users;
DROP POLICY IF EXISTS "settlement_user_users_update" ON users;
DROP POLICY IF EXISTS "driver_users_select" ON users;
DROP POLICY IF EXISTS "driver_users_update" ON users;
DROP POLICY IF EXISTS "admin_users_insert" ON users;
DROP POLICY IF EXISTS "admin_users_delete" ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;

DROP POLICY IF EXISTS "admin_settlements_all" ON settlements;
DROP POLICY IF EXISTS "settlement_user_settlements_select" ON settlements;
DROP POLICY IF EXISTS "settlement_user_settlements_update" ON settlements;
DROP POLICY IF EXISTS "driver_settlements_select" ON settlements;

DROP POLICY IF EXISTS "admin_container_types_all" ON container_types;
DROP POLICY IF EXISTS "users_container_types_select" ON container_types;

DROP POLICY IF EXISTS "admin_pricing_all" ON settlement_tank_pricing;
DROP POLICY IF EXISTS "settlement_user_pricing_select" ON settlement_tank_pricing;
DROP POLICY IF EXISTS "settlement_user_pricing_insert" ON settlement_tank_pricing;
DROP POLICY IF EXISTS "settlement_user_pricing_update" ON settlement_tank_pricing;
DROP POLICY IF EXISTS "settlement_user_pricing_delete" ON settlement_tank_pricing;
DROP POLICY IF EXISTS "driver_pricing_select" ON settlement_tank_pricing;

DROP POLICY IF EXISTS "admin_reports_all" ON reports;
DROP POLICY IF EXISTS "settlement_user_reports_select" ON reports;
DROP POLICY IF EXISTS "driver_reports_select" ON reports;
DROP POLICY IF EXISTS "driver_reports_insert" ON reports;
DROP POLICY IF EXISTS "driver_reports_update" ON reports;

DROP POLICY IF EXISTS "admin_notifications_all" ON notifications;
DROP POLICY IF EXISTS "settlement_user_notifications_select" ON notifications;
DROP POLICY IF EXISTS "driver_notifications_select" ON notifications;
DROP POLICY IF EXISTS "system_notifications_insert" ON notifications;
DROP POLICY IF EXISTS "system_notifications_update" ON notifications;

-- ====================================
-- USERS TABLE POLICIES (Updated)
-- ====================================

-- ADMIN: Full access to all users
CREATE POLICY "admin_users_all" ON users
FOR ALL USING (is_admin_from_metadata());

-- SETTLEMENT_USER: Can view their own profile and other users from same settlement
CREATE POLICY "settlement_user_users_select" ON users
FOR SELECT USING (
    is_settlement_user_from_metadata() AND (
        email = auth.email() OR -- Own profile
        (settlement_id = get_user_settlement_id_from_local() AND settlement_id IS NOT NULL) -- Same settlement
    )
);

-- SETTLEMENT_USER: Can update their own profile only
CREATE POLICY "settlement_user_users_update" ON users
FOR UPDATE USING (
    is_settlement_user_from_metadata() AND email = auth.email()
);

-- DRIVER: Can view and update their own profile only
CREATE POLICY "driver_users_select" ON users
FOR SELECT USING (
    is_driver_from_metadata() AND email = auth.email()
);

CREATE POLICY "driver_users_update" ON users
FOR UPDATE USING (
    is_driver_from_metadata() AND email = auth.email()
);

-- INSERT: Only admins can create new users
CREATE POLICY "admin_users_insert" ON users
FOR INSERT WITH CHECK (is_admin_from_metadata());

-- DELETE: Only admins can delete users
CREATE POLICY "admin_users_delete" ON users
FOR DELETE USING (is_admin_from_metadata());

-- Users can update their own profile
CREATE POLICY "users_self_update" ON users
FOR UPDATE USING (
    is_admin_from_metadata() OR email = auth.email()
) WITH CHECK (
    is_admin_from_metadata() OR email = auth.email()
);

-- ====================================
-- SETTLEMENTS TABLE POLICIES (Updated)
-- ====================================

-- ADMIN: Full access to all settlements
CREATE POLICY "admin_settlements_all" ON settlements
FOR ALL USING (is_admin_from_metadata());

-- SETTLEMENT_USER: Can view their own settlement only
CREATE POLICY "settlement_user_settlements_select" ON settlements
FOR SELECT USING (
    is_settlement_user_from_metadata() AND 
    id = get_user_settlement_id_from_local()
);

-- SETTLEMENT_USER: Can update their own settlement
CREATE POLICY "settlement_user_settlements_update" ON settlements
FOR UPDATE USING (
    is_settlement_user_from_metadata() AND 
    id = get_user_settlement_id_from_local()
);

-- DRIVER: Can view all settlements (needed for creating reports)
CREATE POLICY "driver_settlements_select" ON settlements
FOR SELECT USING (is_driver_from_metadata());

-- ====================================
-- CONTAINER_TYPES TABLE POLICIES (Updated)
-- ====================================

-- ADMIN: Full access to container types
CREATE POLICY "admin_container_types_all" ON container_types
FOR ALL USING (is_admin_from_metadata());

-- SETTLEMENT_USER and DRIVER: Can view all container types (read-only)
CREATE POLICY "users_container_types_select" ON container_types
FOR SELECT USING (
    is_settlement_user_from_metadata() OR is_driver_from_metadata()
);

-- ====================================
-- SETTLEMENT_TANK_PRICING TABLE POLICIES (Updated)
-- ====================================

-- ADMIN: Full access to all pricing
CREATE POLICY "admin_pricing_all" ON settlement_tank_pricing
FOR ALL USING (is_admin_from_metadata());

-- SETTLEMENT_USER: Can view and manage pricing for their settlement
CREATE POLICY "settlement_user_pricing_select" ON settlement_tank_pricing
FOR SELECT USING (
    is_settlement_user_from_metadata() AND 
    settlement_id = get_user_settlement_id_from_local()
);

CREATE POLICY "settlement_user_pricing_insert" ON settlement_tank_pricing
FOR INSERT WITH CHECK (
    is_settlement_user_from_metadata() AND 
    settlement_id = get_user_settlement_id_from_local()
);

CREATE POLICY "settlement_user_pricing_update" ON settlement_tank_pricing
FOR UPDATE USING (
    is_settlement_user_from_metadata() AND 
    settlement_id = get_user_settlement_id_from_local()
);

CREATE POLICY "settlement_user_pricing_delete" ON settlement_tank_pricing
FOR DELETE USING (
    is_settlement_user_from_metadata() AND 
    settlement_id = get_user_settlement_id_from_local()
);

-- DRIVER: Can view pricing for all settlements (needed for calculating report prices)
CREATE POLICY "driver_pricing_select" ON settlement_tank_pricing
FOR SELECT USING (is_driver_from_metadata());

-- ====================================
-- REPORTS TABLE POLICIES (Updated)
-- ====================================

-- ADMIN: Full access to all reports
CREATE POLICY "admin_reports_all" ON reports
FOR ALL USING (is_admin_from_metadata());

-- SETTLEMENT_USER: Can view reports for their settlement
CREATE POLICY "settlement_user_reports_select" ON reports
FOR SELECT USING (
    is_settlement_user_from_metadata() AND 
    settlement_id = get_user_settlement_id_from_local()
);

-- DRIVER: Can view their own reports and create new reports
CREATE POLICY "driver_reports_select" ON reports
FOR SELECT USING (
    is_driver_from_metadata() AND 
    driver_id = (SELECT id FROM users WHERE email = auth.email())
);

CREATE POLICY "driver_reports_insert" ON reports
FOR INSERT WITH CHECK (
    is_driver_from_metadata() AND 
    driver_id = (SELECT id FROM users WHERE email = auth.email())
);

-- DRIVER: Can update their own reports (within 24 hours of creation)
CREATE POLICY "driver_reports_update" ON reports
FOR UPDATE USING (
    is_driver_from_metadata() AND 
    driver_id = (SELECT id FROM users WHERE email = auth.email()) AND
    created_at > (now() - INTERVAL '24 hours')
);

-- ====================================
-- NOTIFICATIONS TABLE POLICIES (Updated)
-- ====================================

-- ADMIN: Full access to all notifications
CREATE POLICY "admin_notifications_all" ON notifications
FOR ALL USING (is_admin_from_metadata());

-- SETTLEMENT_USER: Can view notifications for reports from their settlement
CREATE POLICY "settlement_user_notifications_select" ON notifications
FOR SELECT USING (
    is_settlement_user_from_metadata() AND 
    report_id IN (
        SELECT id FROM reports 
        WHERE settlement_id = get_user_settlement_id_from_local()
    )
);

-- DRIVER: Can view notifications for their own reports
CREATE POLICY "driver_notifications_select" ON notifications
FOR SELECT USING (
    is_driver_from_metadata() AND 
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
-- UPDATE VALIDATION TRIGGER
-- ====================================

-- Update the validate_driver_role function to check user_metadata
CREATE OR REPLACE FUNCTION validate_driver_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the driver has DRIVER role in user_metadata
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = NEW.driver_id AND 
        (raw_user_meta_data ->> 'role') = 'DRIVER'
    ) THEN
        RAISE EXCEPTION 'User with ID % must have DRIVER role to create reports', NEW.driver_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================
-- GRANT PERMISSIONS
-- ====================================

-- Grant execute permissions on updated functions
GRANT EXECUTE ON FUNCTION get_user_role_from_metadata() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_settlement_id_from_local() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_from_metadata() TO authenticated;
GRANT EXECUTE ON FUNCTION is_driver_from_metadata() TO authenticated;
GRANT EXECUTE ON FUNCTION is_settlement_user_from_metadata() TO authenticated;

-- ====================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON FUNCTION get_user_role_from_metadata() IS 'Returns the role of current user from user_metadata';
COMMENT ON FUNCTION get_user_settlement_id_from_local() IS 'Returns the settlement_id of current user from local users table';
COMMENT ON FUNCTION is_admin_from_metadata() IS 'Checks if current user has ADMIN role in user_metadata';
COMMENT ON FUNCTION is_driver_from_metadata() IS 'Checks if current user has DRIVER role in user_metadata';
COMMENT ON FUNCTION is_settlement_user_from_metadata() IS 'Checks if current user has SETTLEMENT_USER role in user_metadata'; 