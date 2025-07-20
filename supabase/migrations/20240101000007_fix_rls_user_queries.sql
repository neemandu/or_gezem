-- Fix RLS Policies to use auth.uid() instead of querying users table
-- Description: Updates RLS policies to avoid permission denied errors when accessing users table

-- ====================================
-- DROP AND RECREATE PROBLEMATIC POLICIES
-- ====================================

-- Drop policies that query users table
DROP POLICY IF EXISTS "driver_reports_select" ON reports;
DROP POLICY IF EXISTS "driver_reports_insert" ON reports;
DROP POLICY IF EXISTS "driver_reports_update" ON reports;
DROP POLICY IF EXISTS "driver_notifications_select" ON notifications;

-- ====================================
-- REPORTS TABLE POLICIES (Fixed)
-- ====================================

-- DRIVER: Can view their own reports - use auth.uid() instead of querying users table
CREATE POLICY "driver_reports_select" ON reports
FOR SELECT USING (
    is_driver_from_metadata() AND 
    driver_id = auth.uid()
);

-- DRIVER: Can create new reports - use auth.uid() instead of querying users table
CREATE POLICY "driver_reports_insert" ON reports
FOR INSERT WITH CHECK (
    is_driver_from_metadata() AND 
    driver_id = auth.uid()
);

-- DRIVER: Can update their own reports (within 24 hours of creation) - use auth.uid()
CREATE POLICY "driver_reports_update" ON reports
FOR UPDATE USING (
    is_driver_from_metadata() AND 
    driver_id = auth.uid() AND
    created_at > (now() - INTERVAL '24 hours')
);

-- ====================================
-- NOTIFICATIONS TABLE POLICIES (Fixed)
-- ====================================

-- DRIVER: Can view notifications for their own reports - use auth.uid()
CREATE POLICY "driver_notifications_select" ON notifications
FOR SELECT USING (
    is_driver_from_metadata() AND 
    report_id IN (
        SELECT id FROM reports 
        WHERE driver_id = auth.uid()
    )
);

-- ====================================
-- UPDATE VALIDATION TRIGGER (Fixed)
-- ====================================

-- Update the validate_driver_role function to use auth.uid()
CREATE OR REPLACE FUNCTION validate_driver_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the driver has DRIVER role in user_metadata using auth.uid()
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND 
        (raw_user_meta_data ->> 'role') = 'DRIVER' AND
        id = NEW.driver_id
    ) THEN
        RAISE EXCEPTION 'User with ID % must have DRIVER role to create reports', NEW.driver_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ====================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON FUNCTION validate_driver_role() IS 'Validates that only users with DRIVER role can create reports using auth.uid() to avoid RLS conflicts'; 