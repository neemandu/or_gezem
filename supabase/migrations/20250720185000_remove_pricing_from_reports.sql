-- Remove pricing data from reports table
-- Description: Removes unit_price, total_price, and currency columns from reports table
-- and removes related constraints and indexes

-- ====================================
-- REMOVE PRICING-RELATED CONSTRAINTS
-- ====================================

-- Remove the total price calculation constraint
ALTER TABLE reports DROP CONSTRAINT IF EXISTS chk_total_price_calculation;

-- Remove the currency format constraint
ALTER TABLE reports DROP CONSTRAINT IF EXISTS chk_currency_format;

-- ====================================
-- REMOVE PRICING-RELATED INDEXES
-- ====================================

-- Remove the total_price index
DROP INDEX IF EXISTS idx_reports_total_price;

-- ====================================
-- REMOVE PRICING-RELATED COLUMNS
-- ====================================

-- Remove unit_price column
ALTER TABLE reports DROP COLUMN IF EXISTS unit_price;

-- Remove total_price column
ALTER TABLE reports DROP COLUMN IF EXISTS total_price;

-- Remove currency column
ALTER TABLE reports DROP COLUMN IF EXISTS currency;

-- ====================================
-- UPDATE COMMENTS
-- ====================================

COMMENT ON TABLE reports IS 'Waste collection reports submitted by drivers (without pricing data)';
COMMENT ON COLUMN reports.volume IS 'Volume of waste collected in container units'; 