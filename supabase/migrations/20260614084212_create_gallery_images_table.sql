-- Gallery images table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read for published gallery images
CREATE POLICY "select_published_gallery" ON gallery_images
  FOR SELECT TO anon USING (status = 'published');