-- Contact form submissions table
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  project_type TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_contact TEXT DEFAULT 'email',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow insert (no read) for anon users
CREATE POLICY "insert_contact_submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);