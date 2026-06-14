-- Projects table for portfolio
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  client TEXT,
  location TEXT,
  year INTEGER,
  project_value TEXT,
  duration TEXT,
  scope TEXT[],
  challenges TEXT,
  solutions TEXT,
  outcomes TEXT,
  featured BOOLEAN DEFAULT false,
  hero_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read for published projects
CREATE POLICY "select_published_projects" ON projects
  FOR SELECT TO anon USING (status = 'published');