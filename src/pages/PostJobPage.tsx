import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    company_id: '',
    category_id: '',
    location: '',
    job_type: 'Full-time',
    salary_range: '',
    requirements: '',
    deadline: '',
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('companies').select('id, name, is_approved').eq('created_by', user.id).then(({ data }) => setCompanies(data || []));
    supabase.from('job_categories').select('*').then(({ data }) => setCategories(data || []));
  }, [user]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const approvedCompanies = companies.filter((c) => c.is_approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!form.title.trim() || !form.company_id) {
      toast({ title: 'Title and company required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('jobs').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      company_id: form.company_id,
      category_id: form.category_id || null,
      location: form.location.trim(),
      job_type: form.job_type,
      salary_range: form.salary_range.trim(),
      requirements: form.requirements.split('\n').filter(Boolean),
      deadline: form.deadline || null,
      created_by: user.id,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Job posted!', description: 'Your job is pending admin approval before it goes live.' });
      navigate('/applications');
    }
  };

  if (previewing) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPreviewing(false)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-subtitle flex-1">Preview</h1>
          <Badge className="bg-status-pending/15 text-status-pending border-0 text-tiny">Pending</Badge>
        </div>
        <div className="px-4 py-5">
          <h2 className="text-display">{form.title || 'Untitled Job'}</h2>
          <p className="text-body text-muted-foreground mt-1">
            {approvedCompanies.find((c) => c.id === form.company_id)?.name || 'No company'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {form.location && <Badge variant="secondary">{form.location}</Badge>}
            <Badge variant="secondary">{form.job_type}</Badge>
          </div>
          {form.salary_range && <p className="mt-3 text-subtitle text-primary">{form.salary_range}</p>}
          {form.description && (
            <div className="mt-5">
              <h3 className="text-subtitle mb-2">Description</h3>
              <p className="text-body text-muted-foreground whitespace-pre-line">{form.description}</p>
            </div>
          )}
          {form.requirements && (
            <div className="mt-5">
              <h3 className="text-subtitle mb-2">Requirements</h3>
              <ul className="space-y-1.5">
                {form.requirements.split('\n').filter(Boolean).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-body text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => setPreviewing(false)} className="flex-1 h-12 rounded-xl">
              Edit
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1 h-12 rounded-xl font-semibold">
              {submitting ? 'Posting...' : 'Submit Job'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-subtitle">Post a Job</h1>
      </div>

      {approvedCompanies.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-display mb-2">🏢</p>
          <p className="text-subtitle mb-2">No approved company yet</p>
          <p className="text-body text-muted-foreground mb-4">
            You need an approved company before posting jobs.
          </p>
          <Button onClick={() => navigate('/company/register')} className="h-12 rounded-xl">
            Register Your Company
          </Button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setPreviewing(true); }} className="px-4 py-5 space-y-4">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Job Title *</label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Software Developer" className="h-12 rounded-xl text-body" required />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Company *</label>
            <select
              value={form.company_id}
              onChange={(e) => update('company_id', e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-3 text-body"
              required
            >
              <option value="">Select company</option>
              {approvedCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-3 text-body"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption font-semibold mb-1.5 block">Location</label>
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Freetown" className="h-12 rounded-xl text-body" />
            </div>
            <div>
              <label className="text-caption font-semibold mb-1.5 block">Job Type</label>
              <select
                value={form.job_type}
                onChange={(e) => update('job_type', e.target.value)}
                className="w-full h-12 rounded-xl border border-input bg-background px-3 text-body"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
                <option>Internship</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Salary Range</label>
            <Input value={form.salary_range} onChange={(e) => update('salary_range', e.target.value)} placeholder="e.g. SLE 5,000 - 8,000/month" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Description</label>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the role..." className="rounded-xl min-h-[120px] text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Requirements (one per line)</label>
            <Textarea value={form.requirements} onChange={(e) => update('requirements', e.target.value)} placeholder="3+ years experience&#10;JavaScript/Python&#10;..." className="rounded-xl min-h-[100px] text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Deadline</label>
            <Input value={form.deadline} onChange={(e) => update('deadline', e.target.value)} type="date" className="h-12 rounded-xl text-body" />
          </div>

          <Button type="submit" className="w-full rounded-xl text-body-lg font-semibold" style={{ height: 52 }}>
            <Eye className="h-5 w-5 mr-2" /> Preview & Submit
          </Button>
        </form>
      )}
    </div>
  );
};

export default PostJobPage;
