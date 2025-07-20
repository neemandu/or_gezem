-- Add personal information fields to users table
-- Description: Adds phone, first_name, and last_name columns to users table

-- ====================================
-- ADD PERSONAL INFO COLUMNS TO USERS TABLE
-- ====================================

-- Add phone column with Israeli phone number validation (consistent with settlements table)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add first_name column
ALTER TABLE users ADD COLUMN first_name VARCHAR(255);

-- Add last_name column  
ALTER TABLE users ADD COLUMN last_name VARCHAR(255);

-- ====================================
-- ADD CONSTRAINTS FOR DATA VALIDATION
-- ====================================

-- Ensure phone numbers are properly formatted (Israeli format, same as settlements table)
ALTER TABLE users ADD CONSTRAINT chk_users_phone_format CHECK (
    phone IS NULL OR 
    phone ~* '^(\+972|0)[2-9][0-9]{7,8}$'
);

-- Ensure first_name and last_name contain only valid characters (Hebrew, English, spaces, hyphens)
ALTER TABLE users ADD CONSTRAINT chk_users_first_name_format CHECK (
    first_name IS NULL OR 
    first_name ~* '^[\u05D0-\u05EAa-zA-Z\s\-''\.]+$'
);

ALTER TABLE users ADD CONSTRAINT chk_users_last_name_format CHECK (
    last_name IS NULL OR 
    last_name ~* '^[\u05D0-\u05EAa-zA-Z\s\-''\.]+$'
);

-- ====================================
-- CREATE INDEXES FOR PERFORMANCE
-- ====================================

-- Index for phone number lookups
CREATE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL;

-- Index for full name searches (first_name, last_name)
CREATE INDEX idx_users_first_name ON users (first_name) WHERE first_name IS NOT NULL;
CREATE INDEX idx_users_last_name ON users (last_name) WHERE last_name IS NOT NULL;

-- Composite index for full name searches
CREATE INDEX idx_users_full_name ON users (first_name, last_name) 
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- ====================================
-- UPDATE RLS POLICIES (if needed)
-- ====================================

-- Note: The existing RLS policies for users table should continue to work
-- as they are based on email and role, not the new personal info fields.
-- No policy updates are required for these new columns.

-- ====================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON COLUMN users.phone IS 'User phone number in Israeli format (+972 or 0 prefix)';
COMMENT ON COLUMN users.first_name IS 'User first name in Hebrew or English';
COMMENT ON COLUMN users.last_name IS 'User last name in Hebrew or English';

-- ====================================
-- MIGRATION VERIFICATION
-- ====================================

-- Verify that the new columns were added successfully
DO $$
BEGIN
    -- Check if phone column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        RAISE EXCEPTION 'phone column was not added to users table';
    END IF;
    
    -- Check if first_name column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        RAISE EXCEPTION 'first_name column was not added to users table';
    END IF;
    
    -- Check if last_name column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        RAISE EXCEPTION 'last_name column was not added to users table';
    END IF;
    
    RAISE NOTICE 'Migration 20240101000004_add_user_personal_info completed successfully!';
    RAISE NOTICE 'Added columns: phone, first_name, last_name to users table';
END $$; 