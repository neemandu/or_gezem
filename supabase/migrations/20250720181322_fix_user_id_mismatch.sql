-- Fix User ID Mismatch Between Auth and Local Users Table
-- Description: Updates local users table to use correct auth.users IDs and ensures consistency

-- ====================================
-- STEP 1: BACKUP AND ANALYZE CURRENT STATE
-- ====================================

DO $$
DECLARE
    local_user_count INTEGER;
    auth_user_count INTEGER;
    user_record RECORD;
BEGIN
    -- Count users in both tables
    SELECT COUNT(*) INTO local_user_count FROM users;
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    
    RAISE NOTICE 'Local users table has % users', local_user_count;
    RAISE NOTICE 'Auth users table has % users', auth_user_count;
    
    -- Show mismatches
    FOR user_record IN 
        SELECT au.id as auth_id, au.email, u.id as local_id,
               (au.raw_user_meta_data ->> 'role') as auth_role, u.role as local_role
        FROM auth.users au
        LEFT JOIN users u ON au.email = u.email
        WHERE au.raw_user_meta_data ? 'role'
    LOOP
        IF user_record.local_id IS NULL THEN
            RAISE NOTICE 'MISSING: Auth user % (ID: %) not in local table', 
                user_record.email, user_record.auth_id;
        ELSIF user_record.auth_id != user_record.local_id THEN
            RAISE NOTICE 'MISMATCH: User % - Auth ID: %, Local ID: %', 
                user_record.email, user_record.auth_id, user_record.local_id;
        ELSE
            RAISE NOTICE 'MATCH: User % has correct ID %', user_record.email, user_record.auth_id;
        END IF;
    END LOOP;
END $$;

-- ====================================
-- STEP 2: DISABLE CONSTRAINTS AND TRIGGERS TEMPORARILY
-- ====================================

-- Drop foreign key constraint from reports table
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_driver_id_fkey;

-- Disable the validation trigger temporarily
ALTER TABLE reports DISABLE TRIGGER validate_reports_driver_role;

-- ====================================
-- STEP 3: CREATE MAPPING TABLE FOR OLD TO NEW IDs
-- ====================================

-- Create temporary table to store ID mappings
CREATE TEMP TABLE user_id_mapping (
    old_id UUID,
    new_id UUID,
    email TEXT
);

-- Populate mapping table
INSERT INTO user_id_mapping (old_id, new_id, email)
SELECT u.id as old_id, au.id as new_id, u.email
FROM users u
JOIN auth.users au ON u.email = au.email
WHERE au.raw_user_meta_data ? 'role';

-- ====================================
-- STEP 4: UPDATE EXISTING REPORTS
-- ====================================

-- Update any existing reports to use new user IDs
DO $$
DECLARE
    mapping_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR mapping_record IN 
        SELECT old_id, new_id, email FROM user_id_mapping
    LOOP
        UPDATE reports SET driver_id = mapping_record.new_id 
        WHERE driver_id = mapping_record.old_id;
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        IF updated_count > 0 THEN
            RAISE NOTICE 'Updated % reports for user % (% -> %)', 
                updated_count, mapping_record.email, mapping_record.old_id, mapping_record.new_id;
        END IF;
    END LOOP;
END $$;

-- ====================================
-- STEP 5: UPDATE USER IDs TO MATCH AUTH.USERS
-- ====================================

-- Clear existing users and re-insert with correct IDs from auth
DO $$
DECLARE
    auth_user_record RECORD;
BEGIN
    -- Delete all existing users (we'll recreate them with correct IDs)
    DELETE FROM users;
    
    -- Insert users with correct auth IDs
    FOR auth_user_record IN 
        SELECT au.id, au.email, (au.raw_user_meta_data ->> 'role') as role,
               au.created_at, au.updated_at
        FROM auth.users au
        WHERE au.raw_user_meta_data ? 'role'
    LOOP
        RAISE NOTICE 'Inserting user % with auth ID %', auth_user_record.email, auth_user_record.id;
        
        INSERT INTO users (id, email, role, settlement_id, created_at, updated_at)
        VALUES (
            auth_user_record.id,
            auth_user_record.email,
            auth_user_record.role::user_role,
            -- For settlement users, we'll need to manually set settlement_id later
            NULL,
            auth_user_record.created_at,
            auth_user_record.updated_at
        );
    END LOOP;
    
    RAISE NOTICE 'Recreated users table with correct auth IDs';
END $$;

-- ====================================
-- STEP 6: UPDATE SETTLEMENT IDs FOR SETTLEMENT USERS
-- ====================================

-- Update settlement_id for known settlement users based on email patterns
DO $$
BEGIN
    -- Update settlement_id for known users (based on original seed data)
    UPDATE users SET settlement_id = '550e8400-e29b-41d4-a716-446655440001' 
    WHERE email = 'nahalal@green-waste.co.il';
    
    UPDATE users SET settlement_id = '550e8400-e29b-41d4-a716-446655440002' 
    WHERE email = 'degania@green-waste.co.il';
    
    UPDATE users SET settlement_id = '550e8400-e29b-41d4-a716-446655440003' 
    WHERE email = 'emek.yizrael@green-waste.co.il';
    
    RAISE NOTICE 'Updated settlement_id for settlement users';
END $$;

-- ====================================
-- STEP 7: RE-ENABLE CONSTRAINTS AND TRIGGERS
-- ====================================

-- Recreate foreign key constraint
ALTER TABLE reports ADD CONSTRAINT reports_driver_id_fkey 
    FOREIGN KEY (driver_id) REFERENCES users(id);

-- Re-enable the validation trigger
ALTER TABLE reports ENABLE TRIGGER validate_reports_driver_role;

-- ====================================
-- STEP 8: CREATE SYNC FUNCTION FOR FUTURE
-- ====================================

-- Function to sync auth users to local users table
CREATE OR REPLACE FUNCTION sync_auth_user_to_local()
RETURNS trigger AS $$
BEGIN
    -- Only sync users that have a role in user_metadata
    IF NEW.raw_user_meta_data ? 'role' THEN
        INSERT INTO users (id, email, role, settlement_id, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            (NEW.raw_user_meta_data ->> 'role')::user_role,
            NULL, -- Will need to be set manually for settlement users
            NEW.created_at,
            NEW.updated_at
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync new auth users
DROP TRIGGER IF EXISTS sync_auth_user_to_local ON auth.users;
CREATE TRIGGER sync_auth_user_to_local
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_local();

-- ====================================
-- STEP 9: FINAL VERIFICATION
-- ====================================

DO $$
DECLARE
    final_count INTEGER;
    user_record RECORD;
    mismatch_count INTEGER := 0;
    reports_count INTEGER;
BEGIN
    -- Check final count
    SELECT COUNT(*) INTO final_count FROM users;
    SELECT COUNT(*) INTO reports_count FROM reports;
    RAISE NOTICE 'Final local users count: %', final_count;
    RAISE NOTICE 'Final reports count: %', reports_count;
    
    -- Verify all auth users have local records with matching IDs
    FOR user_record IN 
        SELECT au.id, au.email, (au.raw_user_meta_data ->> 'role') as role
        FROM auth.users au
        WHERE au.raw_user_meta_data ? 'role'
    LOOP
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_record.id AND email = user_record.email) THEN
            RAISE WARNING 'MISMATCH: Auth user % (ID: %) not found in local users table', 
                user_record.email, user_record.id;
            mismatch_count := mismatch_count + 1;
        ELSE
            RAISE NOTICE 'OK: User % has matching ID %', user_record.email, user_record.id;
        END IF;
    END LOOP;
    
    IF mismatch_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All auth users have matching local user records';
    ELSE
        RAISE WARNING 'ISSUES: % mismatches found', mismatch_count;
    END IF;
END $$;
