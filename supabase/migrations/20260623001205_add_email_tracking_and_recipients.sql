-- Track email notification outcome on each submission
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_error TEXT,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Store notification recipients in the database
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write recipients (used by edge function)
CREATE POLICY "service_select_recipients" ON notification_recipients
  FOR SELECT TO service_role USING (true);
CREATE POLICY "service_insert_recipients" ON notification_recipients
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_update_recipients" ON notification_recipients
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_delete_recipients" ON notification_recipients
  FOR DELETE TO service_role USING (true);

-- Seed the two recipients
INSERT INTO notification_recipients (email, name) VALUES
  ('brumbam@rumbamengineers.com', 'B. Rumbam'),
  ('info@rumbamengineers.com', 'Info')
ON CONFLICT (email) DO NOTHING;
