import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Briefcase, Users, Settings, AlertCircle, BadgeCheck, Plus, Eye, Trash2, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyState } from '@/hooks/useCompanyState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StatusBadge from '@/components/StatusBadge';

// ---- Company Page Tab ----
const CompanyPageTab = ({ company, refetch }: { company: any; refetch: () => void }) => {
  const isVerified = company.verification_stage === 'stage_3';
  const [form, setForm] = useState({
    name: company.name || '',
    tagline: company.tagline || '',
    description: company.description || '',
    industry: company.industry || '',
    location: company.location || '',
    contact_email: company.contact_email || '',
    contact_phone: company.contact_phone || '',
    website: company.website || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('companies').update(form).eq('id', company.id);
    setSaving(false);
    toast({ title: 'Company profile updated' });
    refetch();
  };

  return (
    <div className="space-y-4">
      {!isVerified && (
        <div className="rounded-xl bg-accent border border-primary/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-caption font-semibold">Complete your company details</p>
            <p className="text-tiny text-muted-foreground">Fill in all fields to unlock more features after admin verification.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center text-2xl font-bold text-accent-foreground shrink-0">
          {company.name?.charAt(0) || 'C'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-body-lg font-semibold">{company.name}</h3>
            {isVerified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </div>
          <Badge className="mt-1 text-tiny" variant="secondary">
            {company.verification_stage === 'stage_3' ? 'Trusted Employer' :
             company.verification_stage === 'stage_2' ? 'Verified' : 'Basic'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Company Name</label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Tagline</label>
          <Input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} placeholder="A short description..." className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">About Company</label>
          <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl min-h-[100px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Industry</label>
            <Input value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Location</label>
            <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Email</label>
            <Input value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Phone</label>
            <Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} className="h-11 rounded-xl" />
          </div>
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Website</label>
          <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." className="h-11 rounded-xl" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-semibold">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

// ---- Jobs Tab ----
const JobsTab = ({ company }: { company: any }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = company.verification_stage === 'stage_3';
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', location: '', job_type: 'Full-time',
    salary_range: '', requirements: '', deadline: '',
    custom_questions: [] as { question: string; type: 'text' | 'dropdown' | 'yesno'; options?: string }[],
  });

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('*').eq('company_id', company.id).order('created_at', { ascending: false });
    setJobs(data || []);
  };

  useEffect(() => {
    fetchJobs();
    supabase.from('job_categories').select('*').then(({ data }) => setCategories(data || []));
  }, [company.id]);

  const addQuestion = () => {
    if (form.custom_questions.length >= 5) return;
    setForm(p => ({ ...p, custom_questions: [...p.custom_questions, { question: '', type: 'text' }] }));
  };

  const removeQuestion = (idx: number) => {
    setForm(p => ({ ...p, custom_questions: p.custom_questions.filter((_, i) => i !== idx) }));
  };

  const updateQuestion = (idx: number, field: string, value: string) => {
    setForm(p => ({
      ...p,
      custom_questions: p.custom_questions.map((q, i) => i === idx ? { ...q, [field]: value } : q),
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const status = canSubmit ? 'pending' : 'draft';
    const { error } = await supabase.from('jobs').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      company_id: company.id,
      category_id: form.category_id || null,
      location: form.location.trim(),
      job_type: form.job_type,
      salary_range: form.salary_range.trim(),
      requirements: form.requirements.split('\n').filter(Boolean),
      deadline: form.deadline || null,
      created_by: user.id,
      status,
      custom_questions: form.custom_questions.filter(q => q.question.trim()),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: status === 'draft' ? 'Job saved as draft' : 'Job submitted for approval' });
      setShowCreate(false);
      setPreviewing(false);
      setForm({ title: '', description: '', category_id: '', location: '', job_type: 'Full-time', salary_range: '', requirements: '', deadline: '', custom_questions: [] });
      fetchJobs();
    }
  };

  const getJobStatusBadge = (job: any) => {
    if (job.status === 'draft') return <Badge className="bg-muted text-muted-foreground border-0 text-tiny">Draft</Badge>;
    if (job.is_approved) return <Badge className="bg-success/15 text-[hsl(var(--success))] border-0 text-tiny">Live</Badge>;
    return <Badge className="bg-warning/15 text-[hsl(var(--warning))] border-0 text-tiny">Pending</Badge>;
  };

  if (previewing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setPreviewing(false)} className="p-2 -ml-2 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h2 className="text-subtitle flex-1">Preview</h2>
          <Badge className="bg-warning/15 text-[hsl(var(--warning))] border-0">{canSubmit ? 'Pending Approval' : 'Draft'}</Badge>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-display">{form.title || 'Untitled Job'}</h3>
          <p className="text-body text-muted-foreground mt-1">{company.name}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {form.location && <Badge variant="secondary">{form.location}</Badge>}
            <Badge variant="secondary">{form.job_type}</Badge>
          </div>
          {form.salary_range && <p className="mt-3 text-subtitle text-primary">{form.salary_range}</p>}
          {form.description && <p className="text-body text-muted-foreground whitespace-pre-line mt-4">{form.description}</p>}
          {form.requirements && (
            <div className="mt-4">
              <h4 className="text-body-lg font-semibold mb-2">Requirements</h4>
              <ul className="space-y-1.5">
                {form.requirements.split('\n').filter(Boolean).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-body text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {form.custom_questions.filter(q => q.question.trim()).length > 0 && (
            <div className="mt-4">
              <h4 className="text-body-lg font-semibold mb-2">Application Questions</h4>
              <ul className="space-y-2">
                {form.custom_questions.filter(q => q.question.trim()).map((q, i) => (
                  <li key={i} className="text-body text-muted-foreground">{i + 1}. {q.question} <span className="text-tiny text-muted-foreground">({q.type})</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPreviewing(false)} className="flex-1 h-12 rounded-xl">Edit</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1 h-12 rounded-xl font-semibold">
            {submitting ? 'Saving...' : canSubmit ? 'Submit for Approval' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setShowCreate(false)} className="p-2 -ml-2 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h2 className="text-subtitle">Create Job</h2>
        </div>

        {!canSubmit && (
          <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-[hsl(var(--warning))] mt-0.5 shrink-0" />
            <p className="text-caption text-muted-foreground">Your company is at Stage 2. Jobs will be saved as <strong>drafts</strong> until you reach Trusted Employer status.</p>
          </div>
        )}

        <div>
          <label className="text-caption font-semibold mb-1.5 block">Job Title *</label>
          <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Software Developer" className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Category</label>
          <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-body">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Location</label>
            <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Freetown" className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Job Type</label>
            <select value={form.job_type} onChange={e => setForm(p => ({ ...p, job_type: e.target.value }))} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-body">
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option><option>Internship</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Salary Range</label>
          <Input value={form.salary_range} onChange={e => setForm(p => ({ ...p, salary_range: e.target.value }))} placeholder="e.g. SLE 5,000 - 8,000/month" className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Description</label>
          <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the role..." className="rounded-xl min-h-[100px]" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Requirements (one per line)</label>
          <Textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} placeholder="3+ years experience&#10;JavaScript/Python" className="rounded-xl min-h-[80px]" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Deadline</label>
          <Input value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} type="date" className="h-11 rounded-xl" />
        </div>

        {/* Custom Questions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-caption font-semibold">Application Questions (optional, max 5)</label>
            {form.custom_questions.length < 5 && (
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="h-8 rounded-lg text-tiny">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
              </Button>
            )}
          </div>
          {form.custom_questions.map((q, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} placeholder={`Question ${i + 1}`} className="h-10 rounded-lg flex-1" />
              <select value={q.type} onChange={e => updateQuestion(i, 'type', e.target.value)} className="h-10 rounded-lg border border-input bg-background px-2 text-caption w-24">
                <option value="text">Text</option>
                <option value="dropdown">Dropdown</option>
                <option value="yesno">Yes/No</option>
              </select>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(i)} className="h-10 w-10 p-0 shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={() => { if (form.title.trim()) setPreviewing(true); else toast({ title: 'Job title required', variant: 'destructive' }); }} className="w-full h-12 rounded-xl font-semibold">
          <Eye className="h-5 w-5 mr-2" /> Preview & Submit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-subtitle">Your Jobs</h2>
        <Button onClick={() => setShowCreate(true)} size="sm" className="rounded-lg"><Plus className="h-4 w-4 mr-1" /> Create Job</Button>
      </div>
      {jobs.length === 0 ? (
        <div className="rounded-xl bg-muted p-8 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-body text-muted-foreground">No jobs yet. Create your first job posting!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <div key={j.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-body-lg font-semibold truncate">{j.title}</h3>
                  <p className="text-caption text-muted-foreground">{j.location} • {j.job_type}</p>
                </div>
                {getJobStatusBadge(j)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Applications Tab ----
const ApplicationsTab = ({ company }: { company: any }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    supabase.from('jobs').select('id, title').eq('company_id', company.id).eq('is_approved', true)
      .then(({ data }) => setJobs(data || []));
  }, [company.id]);

  useEffect(() => {
    if (!selectedJob) { setApplications([]); return; }
    setLoadingApps(true);
    supabase.from('job_applications')
      .select('*, profiles!job_applications_applicant_id_fkey(full_name, email, phone, skills)')
      .eq('job_id', selectedJob).order('applied_at', { ascending: false })
      .then(({ data }) => { setApplications(data || []); setLoadingApps(false); });
  }, [selectedJob]);

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from('job_applications').update({ status }).eq('id', appId);
    toast({ title: `Application ${status}` });
    // Re-fetch
    if (selectedJob) {
      const { data } = await supabase.from('job_applications')
        .select('*, profiles!job_applications_applicant_id_fkey(full_name, email, phone, skills)')
        .eq('job_id', selectedJob).order('applied_at', { ascending: false });
      setApplications(data || []);
    }
  };

  const getWhatsAppLink = (phone: string, name: string, jobTitle: string) => {
    const msg = `Hi ${name}, regarding your application for "${jobTitle}" on Job Giver SL. `;
    return `https://wa.me/${phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const getEmailLink = (email: string, name: string, jobTitle: string) => {
    const subject = `Regarding your application for ${jobTitle}`;
    const body = `Dear ${name},\n\nThank you for your application for the position of ${jobTitle}.\n\n`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-caption font-semibold mb-1.5 block">Select Job</label>
        <select value={selectedJob || ''} onChange={e => setSelectedJob(e.target.value || null)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-body">
          <option value="">Choose a job to view applicants</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {loadingApps && <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}

      {!loadingApps && selectedJob && applications.length === 0 && (
        <div className="rounded-xl bg-muted p-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-body text-muted-foreground">No applications for this job yet.</p>
        </div>
      )}

      {applications.map(app => {
        const profile = app.profiles;
        const jobTitle = jobs.find(j => j.id === selectedJob)?.title || 'Job';
        return (
          <div key={app.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-body-lg font-semibold">{profile?.full_name || 'Unknown'}</h3>
                <p className="text-caption text-muted-foreground">{profile?.email}</p>
              </div>
              <StatusBadge status={app.status as any} />
            </div>

            {profile?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.slice(0, 5).map((s: string) => <Badge key={s} variant="secondary" className="text-tiny">{s}</Badge>)}
              </div>
            )}

            {app.cover_note && <p className="text-caption text-muted-foreground bg-muted rounded-lg p-3">{app.cover_note}</p>}

            {app.question_answers && Object.keys(app.question_answers).length > 0 && (
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <p className="text-tiny font-semibold">Answers</p>
                {Object.entries(app.question_answers).map(([q, a]) => (
                  <p key={q} className="text-caption"><strong>{q}:</strong> {String(a)}</p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <select
                value={app.status}
                onChange={e => updateStatus(app.id, e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-2 text-caption"
              >
                <option value="submitted">Submitted</option>
                <option value="viewed">Viewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>

              {profile?.phone && (
                <a href={getWhatsAppLink(profile.phone, profile.full_name, jobTitle)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-9 rounded-lg text-tiny">
                    <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                  </Button>
                </a>
              )}
              {profile?.email && (
                <a href={getEmailLink(profile.email, profile.full_name, jobTitle)}>
                  <Button variant="outline" size="sm" className="h-9 rounded-lg text-tiny">
                    <Mail className="h-3.5 w-3.5 mr-1" /> Email
                  </Button>
                </a>
              )}

              {app.cv_url && (
                <a href={app.cv_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-9 rounded-lg text-tiny">View CV</Button>
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Settings Tab ----
const SettingsTab = ({ company, refetch }: { company: any; refetch: () => void }) => {
  const [visible, setVisible] = useState(company.is_visible ?? true);
  const [whatsapp, setWhatsapp] = useState(company.whatsapp_enabled ?? true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleToggle = async (field: string, value: boolean) => {
    if (field === 'is_visible') setVisible(value);
    if (field === 'whatsapp_enabled') setWhatsapp(value);
    await supabase.from('companies').update({ [field]: value }).eq('id', company.id);
    toast({ title: 'Setting updated' });
  };

  const handleDeactivate = async () => {
    setSaving(true);
    await supabase.from('companies').update({ is_suspended: true }).eq('id', company.id);
    toast({ title: 'Company deactivated' });
    setSaving(false);
    navigate('/profile');
  };

  const stageLabel = company.verification_stage === 'stage_3' ? 'Trusted Employer ✅' :
    company.verification_stage === 'stage_2' ? 'Stage 2: Verified' : 'Stage 1: Basic';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-body-lg font-semibold mb-1">Verification Status</h3>
        <p className="text-caption text-muted-foreground">{stageLabel}</p>
        {company.trust_level === 'trusted' && <Badge className="mt-2 bg-primary/15 text-primary border-0 text-tiny">Trusted Employer</Badge>}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body font-medium">Company Visibility</p>
            <p className="text-tiny text-muted-foreground">Show your company in public listings</p>
          </div>
          <Switch checked={visible} onCheckedChange={v => handleToggle('is_visible', v)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body font-medium">WhatsApp Contact</p>
            <p className="text-tiny text-muted-foreground">Allow applicants to reach you via WhatsApp</p>
          </div>
          <Switch checked={whatsapp} onCheckedChange={v => handleToggle('whatsapp_enabled', v)} />
        </div>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-card p-4 space-y-3">
        <h3 className="text-body-lg font-semibold text-destructive">Danger Zone</h3>
        <Button onClick={handleDeactivate} disabled={saving} variant="outline" className="w-full h-11 rounded-xl text-destructive border-destructive/20">
          {saving ? 'Deactivating...' : 'Deactivate Company'}
        </Button>
      </div>
    </div>
  );
};

// ---- Main Dashboard ----
const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { company, loading, refetch } = useCompanyState();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!company || !company.is_approved) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="sticky top-0 z-30 bg-primary px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10">
          <ArrowLeft className="h-5 w-5 text-primary-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-subtitle text-primary-foreground">{company.name}</h1>
          <p className="text-tiny text-primary-foreground/70">Company Dashboard</p>
        </div>
        {company.verification_stage === 'stage_3' && <BadgeCheck className="h-5 w-5 text-primary-foreground" />}
      </div>

      {company.verification_stage !== 'stage_3' && (
        <div className="mx-4 mt-4 rounded-xl bg-accent border border-primary/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-caption font-semibold">Complete your company details to unlock more features</p>
            <p className="text-tiny text-muted-foreground">Fill in all information and await admin verification for full access.</p>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        <Tabs defaultValue="company">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="company" className="text-tiny"><Building2 className="h-4 w-4 mr-1" /> Company</TabsTrigger>
            <TabsTrigger value="jobs" className="text-tiny"><Briefcase className="h-4 w-4 mr-1" /> Jobs</TabsTrigger>
            <TabsTrigger value="applications" className="text-tiny"><Users className="h-4 w-4 mr-1" /> Apps</TabsTrigger>
            <TabsTrigger value="settings" className="text-tiny"><Settings className="h-4 w-4 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="company"><CompanyPageTab company={company} refetch={refetch} /></TabsContent>
          <TabsContent value="jobs"><JobsTab company={company} /></TabsContent>
          <TabsContent value="applications"><ApplicationsTab company={company} /></TabsContent>
          <TabsContent value="settings"><SettingsTab company={company} refetch={refetch} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDashboard;
