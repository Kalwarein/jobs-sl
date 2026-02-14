
-- Add verification columns to companies
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS verification_stage text DEFAULT 'stage_1',
  ADD COLUMN IF NOT EXISTS trust_level text DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS contact_person_name text,
  ADD COLUMN IF NOT EXISTS contact_person_id_type text,
  ADD COLUMN IF NOT EXISTS reason_for_joining text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS tin_number text,
  ADD COLUMN IF NOT EXISTS date_of_incorporation date,
  ADD COLUMN IF NOT EXISTS operating_address text,
  ADD COLUMN IF NOT EXISTS director_names text[],
  ADD COLUMN IF NOT EXISTS director_id_types text[],
  ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- Company documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_url text NOT NULL,
  file_name text,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  review_status text DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text
);
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own docs" ON public.company_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_documents.company_id AND created_by = auth.uid())
  );
CREATE POLICY "Owners upload docs" ON public.company_documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins manage docs" ON public.company_documents
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
  );

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs" ON public.audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "System insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Admin actions table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage actions" ON public.admin_actions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  enabled boolean DEFAULT true,
  description text,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage flags" ON public.feature_flags
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- App settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}',
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.app_settings
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Add soft delete to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add assignment tracking to user_roles
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS assigned_by uuid,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz DEFAULT now();

-- Super admin enforcement on signup
CREATE OR REPLACE FUNCTION public.enforce_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'wellokal7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to enforce super admin on every login
CREATE OR REPLACE FUNCTION public.ensure_super_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = _user_id;
  IF _email = 'wellokal7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Update has_role to treat super_admin as having all roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = _role OR role = 'super_admin')
  );
$$;

-- Storage bucket for company documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Company owners upload docs storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Company owners view docs storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage docs storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'company-documents' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_company_docs_company ON public.company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_verification ON public.companies(verification_stage);
CREATE INDEX IF NOT EXISTS idx_companies_approved ON public.companies(is_approved);
CREATE INDEX IF NOT EXISTS idx_jobs_approved ON public.jobs(is_approved);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_gigs_approved ON public.gigs(is_approved);
