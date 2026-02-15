
-- Add custom_questions to jobs (JSON array of question objects)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS custom_questions jsonb DEFAULT '[]'::jsonb;

-- Add question_answers to job_applications (JSON object with answers)
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS question_answers jsonb DEFAULT '{}'::jsonb;

-- Add status column for draft/pending/approved/rejected flow
-- (status column already exists, just ensure it supports 'draft')

-- Add rejection_reason to companies for admin feedback
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add tagline and social_links to companies for company page
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS hiring_banner_url text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT true;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS default_contact_email text;
