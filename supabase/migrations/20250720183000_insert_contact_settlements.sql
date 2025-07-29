-- Migration to insert contact settlements data
-- Description: Inserts settlement data from contact.json into settlements table

-- Insert settlements data from contact.json
-- Using individual INSERT statements with NOT EXISTS to avoid duplicates
-- Phone numbers formatted without dashes to match database constraint
INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'בית ינאי', '0523718888', 'איריס דינרמן', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'בית ינאי');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'מושב מרחביה-לימוריה', '0556677045', 'לימוריה', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'מושב מרחביה-לימוריה');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'אלון הגליל', '0526689159', 'לבנת', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'אלון הגליל');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'גבעת חיים איחוד', '0506705793', 'ניב יגר', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'גבעת חיים איחוד');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'ועד מקומי חגור', '0548802047', 'איילת', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'ועד מקומי חגור');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'ועד אגודה חגור', '0549620173', 'עידית', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'ועד אגודה חגור');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'ביתן אהרון', '0543091221', 'אבנר אביגדור', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'ביתן אהרון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'בית חרות', '0543091221', 'אבנר אביגדור', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'בית חרות');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'גניגר', NULL, 'מתחלף כרגע איש קשר-עוד לא ידוע', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'גניגר');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'יד חנה', '0548951808', 'רינה', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'יד חנה');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'נורדיה', '0546799480', 'אורי', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'נורדיה');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'כפר חיים', '0545226808', 'צפריר', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'כפר חיים');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'משמרת', '0524345166', 'דורין', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'משמרת');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'גאולים', '0526666321', 'ציון יעקב', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'גאולים');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'יעף', '0526666321', 'ציון יעקב', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'יעף');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'רפאל / לשם / מכון דוד / גני קדם / שדמה/ אלביט רמה"ש', '0526740979', 'מכון דוד, גני קדם, שדמה, אלביט', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'רפאל / לשם / מכון דוד / גני קדם / שדמה/ אלביט רמה"ש');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'הושעיה', '0528747654', 'ורדית', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'הושעיה');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'בית קשת-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'בית קשת-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'כפר קיש-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'כפר קיש-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'אילניה-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'אילניה-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'שדה אילן-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'שדה אילן-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'שדמות דבורה-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'שדמות דבורה-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'בי"ס כדורי-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'בי"ס כדורי-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'שרונה-גליל תחתון', '0502280588', 'אסף רטיג', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'שרונה-גליל תחתון');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'הדר עם', '0546966111', 'שושי', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'הדר עם');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'בזן', '0529281124', 'ארז', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'בזן');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'כפר ויתקין', '0542277456', 'עדי קסלר', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'כפר ויתקין');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'צור נתן', '0528434330', 'ניסים', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'צור נתן');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'בת שלמה-חוף הכרמל', '0522829487', 'יוסי גבאי', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'בת שלמה-חוף הכרמל');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'דור-חוף הכרמל', '0522829487', 'יוסי גבאי', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'דור-חוף הכרמל');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'כרם מהר"ל-חוף הכרמל', '0522829487', 'יוסי גבאי', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'כרם מהר"ל-חוף הכרמל');

INSERT INTO settlements (name, contact_phone, contact_person, created_at, updated_at)
SELECT 'קיבוץ מרחביה-הדר', '0523638023', 'הדר', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE name = 'קיבוץ מרחביה-הדר');

-- Display summary of inserted settlements
DO $$
BEGIN
    RAISE NOTICE '=== CONTACT SETTLEMENTS MIGRATION SUMMARY ===';
    RAISE NOTICE 'Total settlements after migration: %', (SELECT COUNT(*) FROM settlements);
    RAISE NOTICE 'Settlements with contact info: %', (SELECT COUNT(*) FROM settlements WHERE contact_phone IS NOT NULL);
    RAISE NOTICE 'Settlements without contact info: %', (SELECT COUNT(*) FROM settlements WHERE contact_phone IS NULL);
    RAISE NOTICE '==============================================';
END $$; 