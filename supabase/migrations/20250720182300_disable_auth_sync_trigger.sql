-- Disable Auth Sync Trigger Causing Authentication Issues
-- Description: The sync trigger on auth.users is interfering with the login process

-- ====================================
-- DISABLE PROBLEMATIC SYNC TRIGGER
-- ====================================

-- Drop the trigger that's causing authentication issues
DROP TRIGGER IF EXISTS sync_auth_user_to_local ON auth.users;

-- Keep the function but comment out for future use if needed
-- We can manually sync users when needed instead of automatic trigger
CREATE OR REPLACE FUNCTION sync_auth_user_to_local()
RETURNS trigger AS $$
BEGIN
    -- DISABLED: This trigger was causing authentication issues
    -- The function is kept for potential future manual sync operations
    -- 
    -- Original code:
    -- IF NEW.raw_user_meta_data ? 'role' THEN
    --     INSERT INTO users (id, email, role, settlement_id, created_at, updated_at)
    --     VALUES (
    --         NEW.id,
    --         NEW.email,
    --         (NEW.raw_user_meta_data ->> 'role')::user_role,
    --         NULL,
    --         NEW.created_at,
    --         NEW.updated_at
    --     )
    --     ON CONFLICT (id) DO UPDATE SET
    --         email = EXCLUDED.email,
    --         role = EXCLUDED.role,
    --         updated_at = now();
    -- END IF;
    
    RAISE NOTICE 'sync_auth_user_to_local trigger disabled - manual sync required';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- CREATE MANUAL SYNC FUNCTION
-- ====================================

-- Function to manually sync specific user by email (for admin use)
CREATE OR REPLACE FUNCTION manual_sync_user_by_email(user_email TEXT)
RETURNS boolean AS $$
DECLARE
    auth_user_record RECORD;
BEGIN
    -- Find the auth user
    SELECT au.id, au.email, (au.raw_user_meta_data ->> 'role') as role,
           au.created_at, au.updated_at
    INTO auth_user_record
    FROM auth.users au
    WHERE au.email = user_email AND au.raw_user_meta_data ? 'role';
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Auth user % not found or has no role', user_email;
        RETURN false;
    END IF;
    
    -- Sync to local users table
    INSERT INTO users (id, email, role, settlement_id, created_at, updated_at)
    VALUES (
        auth_user_record.id,
        auth_user_record.email,
        auth_user_record.role::user_role,
        NULL,
        auth_user_record.created_at,
        auth_user_record.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = now();
        
    RAISE NOTICE 'Synced user %', user_email;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- VERIFICATION
-- ====================================

DO $$
BEGIN
    RAISE NOTICE 'Auth sync trigger disabled successfully';
    RAISE NOTICE 'Use manual_sync_user_by_email(email) function for manual sync if needed';
END $$;
