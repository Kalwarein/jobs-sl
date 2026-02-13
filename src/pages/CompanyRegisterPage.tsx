import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CompanyRegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    location: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!form.name.trim()) { toast({ title: 'Company name required', variant: 'destructive' }); return; }

    setSubmitting(true);

    // Add employer role
    await supabase.from('user_roles').upsert({ user_id: user.id, role: 'employer' as any }, { onConflict: 'user_id,role' });

    const { error } = await supabase.from('companies').insert({
      name: form.name.trim(),
      description: form.description.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim(),
      website: form.website.trim(),
      location: form.location.trim(),
      created_by: user.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Company submitted!', description: 'Your company is pending admin approval. You\'ll be notified once approved.' });
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-subtitle">Register as Employer</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
        <div className="rounded-xl bg-accent p-4 border border-primary/10 mb-2">
          <p className="text-caption font-semibold text-accent-foreground">📋 How it works</p>
          <p className="text-body text-muted-foreground mt-1">
            Submit your company details for review. Once an admin approves, you can start posting jobs.
          </p>
        </div>

        <div>
          <label className="text-caption font-semibold mb-1.5 block">Company Name *</label>
          <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Africell Sierra Leone" className="h-12 rounded-xl text-body" required />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Description</label>
          <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell us about your company..." className="rounded-xl min-h-[100px] text-body" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Contact Email</label>
          <Input value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} type="email" placeholder="hr@company.com" className="h-12 rounded-xl text-body" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Contact Phone</label>
          <Input value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} placeholder="+232 XX XXXXXX" className="h-12 rounded-xl text-body" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Website</label>
          <Input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://..." className="h-12 rounded-xl text-body" />
        </div>
        <div>
          <label className="text-caption font-semibold mb-1.5 block">Location</label>
          <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Freetown" className="h-12 rounded-xl text-body" />
        </div>

        <Button type="submit" disabled={submitting} className="w-full rounded-xl text-body-lg font-semibold mt-2" style={{ height: 52 }}>
          {submitting ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </form>
    </div>
  );
};

export default CompanyRegisterPage;
