-- Seed Data for Hebrew Green Waste Management System
-- Description: Adds test data in Hebrew for development and testing

-- ====================================
-- SETTLEMENTS DATA
-- ====================================

INSERT INTO settlements (id, name, contact_phone, contact_person, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'מושב נהלל', '0521234567', 'דוד כהן', now(), now()),
    ('550e8400-e29b-41d4-a716-446655440002', 'קיבוץ דגניה א''', '0549876543', 'רחל לוי', now(), now()),
    ('550e8400-e29b-41d4-a716-446655440003', 'מועצה אזורית עמק יזרעאל', '0505555555', 'משה אברהם', now(), now());

-- ====================================
-- CONTAINER TYPES DATA
-- ====================================

INSERT INTO container_types (id, name, size, unit, created_at, updated_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'מכל קטן', 2.50, 'm³', now(), now()),
    ('660e8400-e29b-41d4-a716-446655440002', 'מכל בינוני', 5.00, 'm³', now(), now()),
    ('660e8400-e29b-41d4-a716-446655440003', 'מכל גדול', 8.00, 'm³', now(), now());

-- ====================================
-- USERS DATA
-- ====================================

-- Admin user
INSERT INTO users (id, email, role, settlement_id, created_at, updated_at) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'admin@green-waste.co.il', 'ADMIN', NULL, now(), now());

-- Settlement users (one for each settlement)
INSERT INTO users (id, email, role, settlement_id, created_at, updated_at) VALUES
    ('770e8400-e29b-41d4-a716-446655440002', 'nahalal@green-waste.co.il', 'SETTLEMENT_USER', '550e8400-e29b-41d4-a716-446655440001', now(), now()),
    ('770e8400-e29b-41d4-a716-446655440003', 'degania@green-waste.co.il', 'SETTLEMENT_USER', '550e8400-e29b-41d4-a716-446655440002', now(), now()),
    ('770e8400-e29b-41d4-a716-446655440004', 'emek.yizrael@green-waste.co.il', 'SETTLEMENT_USER', '550e8400-e29b-41d4-a716-446655440003', now(), now());

-- Driver users
INSERT INTO users (id, email, role, settlement_id, created_at, updated_at) VALUES
    ('770e8400-e29b-41d4-a716-446655440005', 'driver1@green-waste.co.il', 'DRIVER', NULL, now(), now()),
    ('770e8400-e29b-41d4-a716-446655440006', 'driver2@green-waste.co.il', 'DRIVER', NULL, now(), now());

-- ====================================
-- SETTLEMENT TANK PRICING DATA
-- ====================================

-- Pricing for מושב נהלל
INSERT INTO settlement_tank_pricing (id, settlement_id, container_type_id, price, currency, is_active, created_at, updated_at) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 150.00, 'ILS', true, now(), now()),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 280.00, 'ILS', true, now(), now()),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 420.00, 'ILS', true, now(), now());

-- Pricing for קיבוץ דגניה א'
INSERT INTO settlement_tank_pricing (id, settlement_id, container_type_id, price, currency, is_active, created_at, updated_at) VALUES
    ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 140.00, 'ILS', true, now(), now()),
    ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 270.00, 'ILS', true, now(), now()),
    ('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 400.00, 'ILS', true, now(), now());

-- Pricing for מועצה אזורית עמק יזרעאל
INSERT INTO settlement_tank_pricing (id, settlement_id, container_type_id, price, currency, is_active, created_at, updated_at) VALUES
    ('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 160.00, 'ILS', true, now(), now()),
    ('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 300.00, 'ILS', true, now(), now()),
    ('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 450.00, 'ILS', true, now(), now());

-- ====================================
-- SAMPLE REPORTS DATA
-- ====================================

-- Reports from Driver 1
INSERT INTO reports (
    id, settlement_id, driver_id, container_type_id, volume, notes, 
    image_url, image_public_id, unit_price, total_price, currency, 
    notification_sent, created_at, updated_at
) VALUES
    (
        '990e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440001', -- מושב נהלל
        '770e8400-e29b-41d4-a716-446655440005', -- driver1
        '660e8400-e29b-41d4-a716-446655440002', -- מכל בינוני
        4.20,
        'איסוף פסולת ירוקה מהגינה הקהילתית. המיכל היה מלא כמעט לגמרי.',
        'https://example.com/images/report1.jpg',
        'green_waste_001',
        56.00, -- 280/5 per m³
        235.20, -- 4.20 * 56.00
        'ILS',
        false,
        now() - INTERVAL '2 days',
        now() - INTERVAL '2 days'
    ),
    (
        '990e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440002', -- קיבוץ דגניה א'
        '770e8400-e29b-41d4-a716-446655440005', -- driver1
        '660e8400-e29b-41d4-a716-446655440003', -- מכל גדול
        7.50,
        'פסולת גיזום מהפרדס. כולל ענפים גדולים שנחתכו.',
        'https://example.com/images/report2.jpg',
        'green_waste_002',
        50.00, -- 400/8 per m³
        375.00, -- 7.50 * 50.00
        'ILS',
        true,
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    );

-- Reports from Driver 2
INSERT INTO reports (
    id, settlement_id, driver_id, container_type_id, volume, notes,
    image_url, image_public_id, unit_price, total_price, currency,
    notification_sent, created_at, updated_at
) VALUES
    (
        '990e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440003', -- מועצה אזורית עמק יזרעאל
        '770e8400-e29b-41d4-a716-446655440006', -- driver2
        '660e8400-e29b-41d4-a716-446655440001', -- מכל קטן
        2.00,
        'פסולת מגזעת דשא מהמגרש הציבורי.',
        'https://example.com/images/report3.jpg',
        'green_waste_003',
        64.00, -- 160/2.5 per m³
        128.00, -- 2.00 * 64.00
        'ILS',
        false,
        now() - INTERVAL '3 hours',
        now() - INTERVAL '3 hours'
    ),
    (
        '990e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440001', -- מושב נהלל
        '770e8400-e29b-41d4-a716-446655440006', -- driver2
        '660e8400-e29b-41d4-a716-446655440001', -- מכל קטן
        1.80,
        'עלים ושאריות צמחים מהגן הבוטני.',
        NULL,
        NULL,
        60.00, -- 150/2.5 per m³
        108.00, -- 1.80 * 60.00
        'ILS',
        false,
        now() - INTERVAL '1 hour',
        now() - INTERVAL '1 hour'
    );

-- ====================================
-- SAMPLE NOTIFICATIONS DATA
-- ====================================

-- Notification for the second report (which has notification_sent = true)
INSERT INTO notifications (
    id, report_id, type, status, green_api_message_id, message,
    sent_at, delivered_at, created_at
) VALUES
    (
        'aa0e8400-e29b-41d4-a716-446655440001',
        '990e8400-e29b-41d4-a716-446655440002',
        'WHATSAPP',
        'DELIVERED',
        'msg_12345_67890',
        'שלום רחל, דיווח חדש על איסוף פסולת ירוקה בקיבוץ דגניה א''. נפח: 7.5 מ"ק, סכום: 375 ש"ח. לפרטים נוספים היכנסו למערכת.',
        now() - INTERVAL '23 hours',
        now() - INTERVAL '22 hours 30 minutes',
        now() - INTERVAL '1 day'
    );

-- Pending notifications for reports without notifications sent
INSERT INTO notifications (
    id, report_id, type, status, green_api_message_id, message,
    sent_at, delivered_at, created_at
) VALUES
    (
        'aa0e8400-e29b-41d4-a716-446655440002',
        '990e8400-e29b-41d4-a716-446655440001',
        'WHATSAPP',
        'PENDING',
        NULL,
        'שלום דוד, דיווח חדש על איסוף פסולת ירוקה במושב נהלל. נפח: 4.2 מ"ק, סכום: 235.2 ש"ח. לפרטים נוספים היכנסו למערכת.',
        NULL,
        NULL,
        now() - INTERVAL '2 days'
    ),
    (
        'aa0e8400-e29b-41d4-a716-446655440003',
        '990e8400-e29b-41d4-a716-446655440003',
        'WHATSAPP',
        'PENDING',
        NULL,
        'שלום משה, דיווח חדש על איסוף פסולת ירוקה במועצה אזורית עמק יזרעאל. נפח: 2 מ"ק, סכום: 128 ש"ח. לפרטים נוספים היכנסו למערכת.',
        NULL,
        NULL,
        now() - INTERVAL '3 hours'
    ),
    (
        'aa0e8400-e29b-41d4-a716-446655440004',
        '990e8400-e29b-41d4-a716-446655440004',
        'WHATSAPP',
        'PENDING',
        NULL,
        'שלום דוד, דיווח חדש על איסוף פסולת ירוקה במושב נהלל. נפח: 1.8 מ"ק, סכום: 108 ש"ח. לפרטים נוספים היכנסו למערכת.',
        NULL,
        NULL,
        now() - INTERVAL '1 hour'
    );

-- ====================================
-- VERIFY DATA INTEGRITY
-- ====================================

-- Check that all foreign key relationships are valid
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check users.settlement_id references
    SELECT COUNT(*) INTO invalid_count 
    FROM users u 
    LEFT JOIN settlements s ON u.settlement_id = s.id 
    WHERE u.settlement_id IS NOT NULL AND s.id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Invalid settlement_id references in users table: %', invalid_count;
    END IF;
    
    -- Check settlement_tank_pricing references
    SELECT COUNT(*) INTO invalid_count 
    FROM settlement_tank_pricing stp
    LEFT JOIN settlements s ON stp.settlement_id = s.id
    LEFT JOIN container_types ct ON stp.container_type_id = ct.id
    WHERE s.id IS NULL OR ct.id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Invalid references in settlement_tank_pricing table: %', invalid_count;
    END IF;
    
    -- Check reports references
    SELECT COUNT(*) INTO invalid_count 
    FROM reports r
    LEFT JOIN settlements s ON r.settlement_id = s.id
    LEFT JOIN users u ON r.driver_id = u.id
    LEFT JOIN container_types ct ON r.container_type_id = ct.id
    WHERE s.id IS NULL OR u.id IS NULL OR ct.id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Invalid references in reports table: %', invalid_count;
    END IF;
    
    -- Check notifications references
    SELECT COUNT(*) INTO invalid_count 
    FROM notifications n
    LEFT JOIN reports r ON n.report_id = r.id
    WHERE r.id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Invalid report_id references in notifications table: %', invalid_count;
    END IF;
    
    RAISE NOTICE 'All seed data integrity checks passed successfully!';
END $$;

-- ====================================
-- SUMMARY STATISTICS
-- ====================================

-- Generate summary of inserted data
DO $$
BEGIN
    RAISE NOTICE '=== SEED DATA SUMMARY ===';
    RAISE NOTICE 'Settlements: %', (SELECT COUNT(*) FROM settlements);
    RAISE NOTICE 'Container Types: %', (SELECT COUNT(*) FROM container_types);
    RAISE NOTICE 'Users: % (Admin: %, Settlement: %, Driver: %)', 
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM users WHERE role = 'ADMIN'),
        (SELECT COUNT(*) FROM users WHERE role = 'SETTLEMENT_USER'),
        (SELECT COUNT(*) FROM users WHERE role = 'DRIVER');
    RAISE NOTICE 'Pricing Records: %', (SELECT COUNT(*) FROM settlement_tank_pricing);
    RAISE NOTICE 'Reports: %', (SELECT COUNT(*) FROM reports);
    RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM notifications);
    RAISE NOTICE '=========================';
END $$; 