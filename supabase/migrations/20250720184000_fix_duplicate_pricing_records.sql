-- Fix duplicate pricing records
-- Description: Removes duplicate active pricing records and ensures only one active record per settlement-container combination

-- First, let's identify any duplicate records
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT settlement_id, container_type_id, COUNT(*)
        FROM settlement_tank_pricing
        WHERE is_active = true
        GROUP BY settlement_id, container_type_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate active pricing records', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate active pricing records found';
    END IF;
END $$;

-- Remove duplicate active pricing records, keeping only the most recent one
DELETE FROM settlement_tank_pricing
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY settlement_id, container_type_id 
                   ORDER BY created_at DESC
               ) as rn
        FROM settlement_tank_pricing
        WHERE is_active = true
    ) ranked
    WHERE rn > 1
);

-- Verify the cleanup
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM (
        SELECT settlement_id, container_type_id, COUNT(*)
        FROM settlement_tank_pricing
        WHERE is_active = true
        GROUP BY settlement_id, container_type_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF remaining_count > 0 THEN
        RAISE EXCEPTION 'Still have % duplicate active pricing records after cleanup', remaining_count;
    ELSE
        RAISE NOTICE 'Successfully cleaned up duplicate pricing records';
    END IF;
END $$;

-- Add a more restrictive unique constraint to prevent future duplicates
-- First drop the existing constraint
ALTER TABLE settlement_tank_pricing 
DROP CONSTRAINT IF EXISTS settlement_tank_pricing_settlement_id_container_type_id_is_active_key;

-- Create a unique index instead of a constraint to handle the WHERE clause properly
CREATE UNIQUE INDEX IF NOT EXISTS idx_settlement_tank_pricing_active_unique 
ON settlement_tank_pricing (settlement_id, container_type_id) 
WHERE is_active = true;

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_settlement_tank_pricing_active_lookup 
ON settlement_tank_pricing (settlement_id, container_type_id, is_active, created_at DESC); 