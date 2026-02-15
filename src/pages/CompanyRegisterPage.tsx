import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const industries = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Agriculture',
  'Mining', 'Construction', 'Hospitality', 'Telecommunications', 'NGO / Non-Profit',
  'Government', 'Manufacturing', 'Media & Entertainment', 'Retail', 'Other',
];

const idTypes = ['National ID', 'Passport', 'Driver\'s License', 'Voter ID'];

const CompanyRegisterPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', business_type: '', industry: '', contact_phone: '', contact_email: '',
    location: '', contact_person_name: '', contact_person_id_type: '',
    reason_for_joining: '', description: '', website: '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const canProceedStep1 = form.name.trim() && form.business_type.trim() && form.industry;
  const canProceedStep2 = form.contact_phone.trim() && form.contact_email.trim() && form.contact_person_name.trim();

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);

    // Check if there's an existing rejected company to update
    const { data: existing } = await supabase.from('companies')
      .select('id')
      .eq('created_by', user.id)
      .not('rejection_reason', 'is', null)
      .maybeSingle();

    let error;
    if (existing) {
      // Update the rejected company
      const { error: updateErr } = await supabase.from('companies').update({
        name: form.name.trim(),
        description: form.description.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
        business_type: form.business_type.trim(),
        industry: form.industry,
        contact_person_name: form.contact_person_name.trim(),
        contact_person_id_type: form.contact_person_id_type,
        reason_for_joining: form.reason_for_joining.trim(),
        rejection_reason: null,
        verification_stage: 'stage_1',
        is_approved: false,
      }).eq('id', existing.id);
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase.from('companies').insert({
        name: form.name.trim(),
        description: form.description.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
        business_type: form.business_type.trim(),
        industry: form.industry,
        contact_person_name: form.contact_person_name.trim(),
        contact_person_id_type: form.contact_person_id_type,
        reason_for_joining: form.reason_for_joining.trim(),
        created_by: user.id,
        verification_stage: 'stage_1',
      });
      error = insertErr;
    }

    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Application submitted!', description: 'Your company is pending admin review.' });
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-subtitle flex-1">Apply as Company</h1>
        <span className="text-caption text-muted-foreground">Step {step}/{totalSteps}</span>
      </div>

      <div className="px-4 pt-3">
        <Progress value={progress} className="h-2 rounded-full mb-5" />
      </div>

      {step === 1 && (
        <div className="px-4 space-y-4">
          <div className="rounded-xl bg-accent p-4 border border-primary/10">
            <p className="text-caption font-semibold text-accent-foreground">📋 Stage 1: Basic Information</p>
            <p className="text-body text-muted-foreground mt-1">
              Tell us about your company. This information will be reviewed by our team.
            </p>
          </div>

          <div>
            <label className="text-caption font-semibold mb-1.5 block">Company Name *</label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Africell Sierra Leone" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Business Type *</label>
            <Input value={form.business_type} onChange={e => update('business_type', e.target.value)} placeholder="e.g. Limited Company, Sole Proprietor" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Industry *</label>
            <select
              value={form.industry}
              onChange={e => update('industry', e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-3 text-body"
            >
              <option value="">Select industry</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Description</label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell us about your company..." className="rounded-xl min-h-[100px] text-body" />
          </div>

          <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full rounded-xl text-body-lg font-semibold" style={{ height: 52 }}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="px-4 space-y-4">
          <div className="rounded-xl bg-accent p-4 border border-primary/10">
            <p className="text-caption font-semibold text-accent-foreground">📞 Contact Information</p>
            <p className="text-body text-muted-foreground mt-1">Provide contact details for your company.</p>
          </div>

          <div>
            <label className="text-caption font-semibold mb-1.5 block">Phone Number *</label>
            <Input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} placeholder="+232 XX XXXXXX" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Email Address *</label>
            <Input value={form.contact_email} onChange={e => update('contact_email', e.target.value)} type="email" placeholder="hr@company.com" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Physical Address</label>
            <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. 5 Wilkinson Road, Freetown" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Contact Person Name *</label>
            <Input value={form.contact_person_name} onChange={e => update('contact_person_name', e.target.value)} placeholder="Full name" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Contact Person ID Type</label>
            <select
              value={form.contact_person_id_type}
              onChange={e => update('contact_person_id_type', e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-3 text-body"
            >
              <option value="">Select ID type (optional)</option>
              {idTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Website</label>
            <Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://..." className="h-12 rounded-xl text-body" />
          </div>

          <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="w-full rounded-xl text-body-lg font-semibold" style={{ height: 52 }}>
            Continue
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="px-4 space-y-4">
          <div className="rounded-xl bg-accent p-4 border border-primary/10">
            <p className="text-caption font-semibold text-accent-foreground">✅ Review & Submit</p>
            <p className="text-body text-muted-foreground mt-1">Review your information before submitting.</p>
          </div>

          <div>
            <label className="text-caption font-semibold mb-1.5 block">Reason for Joining</label>
            <Textarea value={form.reason_for_joining} onChange={e => update('reason_for_joining', e.target.value)} placeholder="Why do you want to join Job Giver SL?" className="rounded-xl min-h-[80px] text-body" />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-caption font-semibold">Summary</h3>
            <div className="text-caption text-muted-foreground space-y-1">
              <p><strong>Company:</strong> {form.name}</p>
              <p><strong>Type:</strong> {form.business_type}</p>
              <p><strong>Industry:</strong> {form.industry}</p>
              <p><strong>Contact:</strong> {form.contact_person_name}</p>
              <p><strong>Email:</strong> {form.contact_email}</p>
              <p><strong>Phone:</strong> {form.contact_phone}</p>
              <p><strong>Location:</strong> {form.location || '—'}</p>
            </div>
          </div>

          <div className="rounded-xl bg-info/10 p-4 border border-info/20">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-info mt-0.5 shrink-0" />
              <div>
                <p className="text-caption font-semibold text-info">What happens next?</p>
                <p className="text-body text-muted-foreground mt-1">
                  Your application will be reviewed by our admin team. You'll receive a notification once your company is approved. After Stage 1 approval, you may be asked to submit additional documents for full verification (Stage 2 & 3).
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full rounded-xl text-body-lg font-semibold" style={{ height: 52 }}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompanyRegisterPage;
