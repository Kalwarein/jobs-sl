
-- =============================================
-- JOB GIVER SL - Complete Database Schema
-- =============================================

-- 1. ROLE ENUM
CREATE TYPE public.app_role AS ENUM ('job_seeker', 'employer', 'freelancer', 'admin');

-- 2. USER ROLES TABLE (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'job_seeker',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  location TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  profile_completion INTEGER DEFAULT 10,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. JOB CATEGORIES
CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '📋',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;

-- 5. COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 6. JOBS
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.job_categories(id),
  location TEXT DEFAULT '',
  job_type TEXT DEFAULT 'Full-time',
  salary_range TEXT,
  requirements TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 7. JOB APPLICATIONS
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_url TEXT,
  cover_note TEXT DEFAULT '',
  status TEXT DEFAULT 'submitted',
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 8. SAVED JOBS
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- 9. GIGS
CREATE TABLE public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  budget TEXT,
  category TEXT DEFAULT '',
  location TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- 10. GIG APPLICATIONS
CREATE TABLE public.gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'submitted',
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gig_id, applicant_id)
);
ALTER TABLE public.gig_applications ENABLE ROW LEVEL SECURITY;

-- 11. NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 12. REPORTS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (security definer)
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- =============================================
-- TRIGGER: Auto-create profile + role on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'job_seeker');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER: updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON public.gigs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- RLS POLICIES
-- =============================================

-- USER ROLES
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles readable" ON public.profiles FOR SELECT USING (true);

-- JOB CATEGORIES (public read)
CREATE POLICY "Anyone can view categories" ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.job_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COMPANIES
CREATE POLICY "View approved companies" ON public.companies FOR SELECT USING (is_approved = true);
CREATE POLICY "Owners view own companies" ON public.companies FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Admins view all companies" ON public.companies FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employers create companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners update companies" ON public.companies FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins update companies" ON public.companies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- JOBS
CREATE POLICY "View approved jobs" ON public.jobs FOR SELECT USING (is_approved = true);
CREATE POLICY "Owners view own jobs" ON public.jobs FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Admins view all jobs" ON public.jobs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employers create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners update jobs" ON public.jobs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins update jobs" ON public.jobs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- JOB APPLICATIONS
CREATE POLICY "Applicants view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Job owners view applications" ON public.job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.created_by = auth.uid())
);
CREATE POLICY "Admins view all applications" ON public.job_applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can apply" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Job owners update application status" ON public.job_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.created_by = auth.uid())
);

-- SAVED JOBS
CREATE POLICY "Users manage own saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);

-- GIGS
CREATE POLICY "View approved gigs" ON public.gigs FOR SELECT USING (is_approved = true);
CREATE POLICY "Owners view own gigs" ON public.gigs FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Admins view all gigs" ON public.gigs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create gigs" ON public.gigs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners update gigs" ON public.gigs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins update gigs" ON public.gigs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- GIG APPLICATIONS
CREATE POLICY "Applicants view own gig apps" ON public.gig_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Gig owners view applications" ON public.gig_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.gigs WHERE gigs.id = gig_applications.gig_id AND gigs.created_by = auth.uid())
);
CREATE POLICY "Users apply to gigs" ON public.gig_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- NOTIFICATIONS
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System creates notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- REPORTS
CREATE POLICY "Users view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins view all reports" ON public.reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- SEED: Default job categories
-- =============================================

INSERT INTO public.job_categories (name, icon) VALUES
  ('Technology', '💻'),
  ('Healthcare', '🏥'),
  ('Education', '📚'),
  ('Finance', '💰'),
  ('Construction', '🏗️'),
  ('Agriculture', '🌾'),
  ('NGO', '🤝'),
  ('Hospitality', '🏨'),
  ('Transport', '🚛'),
  ('Mining', '⛏️'),
  ('Media', '📺'),
  ('Government', '🏛️');
