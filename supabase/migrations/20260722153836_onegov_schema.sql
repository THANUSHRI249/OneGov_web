/*
# OneGov — Document Vault & Application Tracker schema

1. Purpose
   OneGov is a unified dashboard where authenticated citizens/business owners store
   government documents and track government applications. This migration creates
   the data tables and a private storage bucket for uploaded files.

2. New Tables
   - `documents`
       id (uuid, pk), user_id (uuid, owner), document_name (text), document_type (text),
       file_path (text, storage object path), file_size (bigint), upload_date (timestamptz)
   - `applications`
       id (uuid, pk), user_id (uuid, owner), application_name (text), application_number (text),
       status (text), submitted_date (timestamptz), latest_update (text), last_updated (timestamptz)
   - `application_updates`
       id (uuid, pk), application_id (uuid fk), status (text), note (text), created_at (timestamptz)
       Serves as the timeline for each application.

3. Storage
   - Creates private bucket `documents` for user file uploads.
   - Storage policies scope object access to the owning user via folder prefix = user_id.

4. Security (RLS)
   - RLS enabled on all tables.
   - documents, applications, application_updates: owner-scoped CRUD (TO authenticated, auth.uid() = user_id).
   - application_updates access derived from parent application ownership.
   - Storage objects in `documents` bucket scoped to owning user.

5. Notes
   - Users authenticate via Supabase Auth (auth.users). No custom users table needed.
   - Owner columns default to auth.uid() so client inserts omitting user_id still satisfy WITH CHECK.
*/

-- ===== documents table =====
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  upload_date timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== applications table =====
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_name text NOT NULL,
  application_number text NOT NULL,
  status text NOT NULL DEFAULT 'Submitted',
  submitted_date timestamptz NOT NULL DEFAULT now(),
  latest_update text,
  last_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== application_updates (timeline) table =====
CREATE TABLE IF NOT EXISTS application_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE application_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_application_updates" ON application_updates;
CREATE POLICY "select_own_application_updates" ON application_updates FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_updates.application_id AND a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_application_updates" ON application_updates;
CREATE POLICY "insert_own_application_updates" ON application_updates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_updates.application_id AND a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_application_updates" ON application_updates;
CREATE POLICY "delete_own_application_updates" ON application_updates FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_updates.application_id AND a.user_id = auth.uid())
  );

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_application_updates_application_id ON application_updates(application_id);

-- ===== Storage bucket for documents =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: scope each object to its owner via folder prefix = user_id
DROP POLICY IF EXISTS "select_own_document_files" ON storage.objects;
CREATE POLICY "select_own_document_files" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "insert_own_document_files" ON storage.objects;
CREATE POLICY "insert_own_document_files" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "delete_own_document_files" ON storage.objects;
CREATE POLICY "delete_own_document_files" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );
