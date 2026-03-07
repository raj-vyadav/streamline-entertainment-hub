
-- Create storage bucket for content media (thumbnails and videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-media', 'content-media', true);

-- Allow anyone to read files (public bucket)
CREATE POLICY "Public read access for content media"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-media');

-- Allow admins to upload files
CREATE POLICY "Admins can upload content media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-media'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update files
CREATE POLICY "Admins can update content media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-media'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete content media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-media'
  AND public.has_role(auth.uid(), 'admin')
);
