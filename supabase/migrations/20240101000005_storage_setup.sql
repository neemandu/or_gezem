-- Storage Setup for Hebrew Green Waste Management System
-- Description: Creates storage buckets and policies for image uploads

-- ====================================
-- CREATE STORAGE BUCKETS
-- ====================================

-- Create the reports bucket for storing report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  true, -- Public bucket for easy access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- ====================================
-- STORAGE POLICIES
-- ====================================

-- Allow all authenticated users to upload to reports bucket
-- (We'll handle role-based restrictions at the application level)
CREATE POLICY "Allow authenticated uploads to reports bucket" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'reports');

-- Allow public read access to reports bucket (for viewing images)
CREATE POLICY "Allow public read access to reports bucket" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'reports');

-- Allow authenticated users to update files (simplified for now)
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'reports');

-- Allow authenticated users to delete files (simplified for now)
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'reports');

-- ====================================
-- HELPER FUNCTION FOR BETTER FILE ORGANIZATION
-- ====================================

-- Function to generate organized file paths
CREATE OR REPLACE FUNCTION generate_report_image_path(user_id UUID, file_extension TEXT)
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  filename TEXT;
BEGIN
  year_month := to_char(now(), 'YYYY/MM');
  filename := user_id::text || '_' || extract(epoch from now())::bigint || '.' || file_extension;
  RETURN 'images/' || year_month || '/' || filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION generate_report_image_path(UUID, TEXT) TO authenticated;

-- ====================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON FUNCTION generate_report_image_path(UUID, TEXT) IS 'Generates organized file paths for report images by user and date'; 