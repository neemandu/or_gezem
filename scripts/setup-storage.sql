-- Manual Storage Setup Script
-- Run this in your Supabase SQL Editor if migrations don't work

-- Create the reports bucket (with conflict handling)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Drop any existing conflicting policies first
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Storage policies (matching migration naming)
CREATE POLICY "Allow authenticated uploads to reports bucket" ON storage.objects
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow public read access to reports bucket" ON storage.objects
FOR SELECT TO public 
USING (bucket_id = 'reports');

CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE TO authenticated 
USING (bucket_id = 'reports');

CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE TO authenticated 
USING (bucket_id = 'reports'); 