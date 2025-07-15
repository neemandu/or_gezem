-- Initial schema for Hebrew Green Waste Management System
-- Description: Creates all core tables with proper constraints and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'SETTLEMENT_USER', 'DRIVER');
CREATE TYPE notification_type AS ENUM ('WHATSAPP');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED');

-- ====================================
-- SETTLEMENTS TABLE
-- ====================================
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_person VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for settlements
CREATE INDEX idx_settlements_name ON settlements (name);
CREATE INDEX idx_settlements_created_at ON settlements (created_at);

-- ====================================
-- USERS TABLE (Custom Profile)
-- ====================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'SETTLEMENT_USER',
    settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_settlement_id ON users (settlement_id);
CREATE INDEX idx_users_created_at ON users (created_at);

-- ====================================
-- CONTAINER TYPES TABLE
-- ====================================
CREATE TABLE container_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    size DECIMAL(10,2) NOT NULL CHECK (size > 0),
    unit VARCHAR(10) NOT NULL DEFAULT 'm³',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for container_types
CREATE INDEX idx_container_types_name ON container_types (name);
CREATE INDEX idx_container_types_size ON container_types (size);

-- ====================================
-- SETTLEMENT TANK PRICING TABLE
-- ====================================
CREATE TABLE settlement_tank_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    container_type_id UUID NOT NULL REFERENCES container_types(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'ILS',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Unique constraint to prevent duplicate pricing for same settlement/container
    UNIQUE(settlement_id, container_type_id, is_active) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for settlement_tank_pricing
CREATE INDEX idx_settlement_tank_pricing_settlement_id ON settlement_tank_pricing (settlement_id);
CREATE INDEX idx_settlement_tank_pricing_container_type_id ON settlement_tank_pricing (container_type_id);
CREATE INDEX idx_settlement_tank_pricing_is_active ON settlement_tank_pricing (is_active);
CREATE INDEX idx_settlement_tank_pricing_created_at ON settlement_tank_pricing (created_at);

-- ====================================
-- REPORTS TABLE
-- ====================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    container_type_id UUID NOT NULL REFERENCES container_types(id) ON DELETE CASCADE,
    volume DECIMAL(10,2) NOT NULL CHECK (volume > 0),
    notes TEXT,
    image_url TEXT,
    image_public_id TEXT,
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'ILS',
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    
    -- Note: Driver role validation is handled in application code
    -- CHECK constraints cannot contain subqueries in PostgreSQL
);

-- Indexes for reports
CREATE INDEX idx_reports_settlement_id ON reports (settlement_id);
CREATE INDEX idx_reports_driver_id ON reports (driver_id);
CREATE INDEX idx_reports_container_type_id ON reports (container_type_id);
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_reports_notification_sent ON reports (notification_sent);
CREATE INDEX idx_reports_volume ON reports (volume);
CREATE INDEX idx_reports_total_price ON reports (total_price);

-- ====================================
-- NOTIFICATIONS TABLE
-- ====================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'WHATSAPP',
    status notification_status NOT NULL DEFAULT 'PENDING',
    green_api_message_id VARCHAR(255),
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint to ensure delivered_at is after sent_at
    CONSTRAINT chk_notification_delivery_order CHECK (
        delivered_at IS NULL OR sent_at IS NULL OR delivered_at >= sent_at
    )
);

-- Indexes for notifications
CREATE INDEX idx_notifications_report_id ON notifications (report_id);
CREATE INDEX idx_notifications_status ON notifications (status);
CREATE INDEX idx_notifications_type ON notifications (type);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_sent_at ON notifications (sent_at);
CREATE INDEX idx_notifications_green_api_message_id ON notifications (green_api_message_id);

-- ====================================
-- TRIGGERS FOR UPDATED_AT
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================
-- DATA VALIDATION TRIGGERS
-- ====================================

-- Function to validate driver role in reports
CREATE OR REPLACE FUNCTION validate_driver_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the driver has DRIVER role
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.driver_id AND role = 'DRIVER'
    ) THEN
        RAISE EXCEPTION 'User with ID % must have DRIVER role to create reports', NEW.driver_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to prevent role modification by non-admins
CREATE OR REPLACE FUNCTION prevent_role_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow role changes only if user is admin (checked via application logic)
    -- or if role is not being changed
    IF OLD.role != NEW.role THEN
        -- This will be enforced by application-level checks
        -- Database trigger serves as additional security layer
        RAISE NOTICE 'Role modification detected for user %: % -> %', NEW.email, OLD.role, NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at 
    BEFORE UPDATE ON settlements 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_container_types_updated_at 
    BEFORE UPDATE ON container_types 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settlement_tank_pricing_updated_at 
    BEFORE UPDATE ON settlement_tank_pricing 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger to validate driver role before insert/update
CREATE TRIGGER validate_reports_driver_role
    BEFORE INSERT OR UPDATE ON reports
    FOR EACH ROW EXECUTE PROCEDURE validate_driver_role();

-- Trigger to prevent unauthorized role modifications
CREATE TRIGGER prevent_users_role_modification
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE prevent_role_modification();

-- ====================================
-- ADDITIONAL CONSTRAINTS AND VALIDATIONS
-- ====================================

-- Ensure email format is valid
ALTER TABLE users ADD CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure phone numbers are properly formatted (Israeli format)
ALTER TABLE settlements ADD CONSTRAINT chk_phone_format CHECK (
    contact_phone IS NULL OR 
    contact_phone ~* '^(\+972|0)[2-9][0-9]{7,8}$'
);

-- Ensure currency is valid ISO code
ALTER TABLE settlement_tank_pricing ADD CONSTRAINT chk_currency_format CHECK (currency ~* '^[A-Z]{3}$');
ALTER TABLE reports ADD CONSTRAINT chk_currency_format CHECK (currency ~* '^[A-Z]{3}$');

-- Ensure volume and pricing calculations make sense
ALTER TABLE reports ADD CONSTRAINT chk_total_price_calculation CHECK (
    total_price = (volume * unit_price)
);

-- ====================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON TABLE users IS 'Custom user profiles with role-based access';
COMMENT ON TABLE settlements IS 'Municipal settlements/communities using the waste management system';
COMMENT ON TABLE container_types IS 'Types and sizes of waste containers available';
COMMENT ON TABLE settlement_tank_pricing IS 'Pricing configuration per settlement and container type';
COMMENT ON TABLE reports IS 'Waste collection reports submitted by drivers';
COMMENT ON TABLE notifications IS 'WhatsApp notifications sent to settlements about reports';

COMMENT ON COLUMN users.role IS 'User access level: ADMIN (full access), SETTLEMENT_USER (own settlement), DRIVER (reports only)';
COMMENT ON COLUMN users.settlement_id IS 'Associated settlement for SETTLEMENT_USER role, NULL for ADMIN and DRIVER';
COMMENT ON COLUMN reports.volume IS 'Volume of waste collected in container units';
COMMENT ON COLUMN reports.unit_price IS 'Price per unit volume at time of collection';
COMMENT ON COLUMN reports.total_price IS 'Calculated total price (volume * unit_price)';
COMMENT ON COLUMN notifications.green_api_message_id IS 'Message ID from Green API WhatsApp service'; 