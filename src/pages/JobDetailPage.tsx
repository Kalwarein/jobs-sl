import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, BadgeCheck, Bookmark, Share2, Flag, Building2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('jobs').select('*, companies(name, is_approved, logo_url, description, location as company_location, verification_stage)')
      .eq('id', id).single()
      .then(({ data }) => { setJob(data); setLoading(false); });

    // Check saved status
    if (user) {
      supabase.from('saved_jobs').select('id').eq('job_id', id).eq('user_id', user.id).maybeSingle()
        .then(({ data }) => setSaved(!!data));
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    const { error } = await supabase.from('job_applications').insert({
      job_id: job.id,
      applicant_id: user.id,
      cover_note: coverNote.trim() || null,
      question_answers: Object.keys(questionAnswers).length > 0 ? questionAnswers : null,
    });
    setApplying(false);
    if (error?.code === '23505') {
      toast({ title: 'Already applied', description: 'You have already applied to this job.' });
    } else if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Applied!', description: 'Your application has been submitted.' });
      setShowApplyDialog(false);
    }
  };

  const handleSave = async () => {
    if (!user || !job) return;
    if (saved) {
      await supabase.from('saved_jobs').delete().eq('job_id', job.id).eq('user_id', user.id);
      setSaved(false);
      toast({ title: 'Removed from saved' });
    } else {
      await supabase.from('saved_jobs').insert({ job_id: job.id, user_id: user.id });
      setSaved(true);
      toast({ title: 'Job saved!' });
    }
  };

  const handleWhatsAppShare = () => {
    if (!job) return;
    const url = window.location.href;
    const text = `Check out this job: ${job.title} at ${job.companies?.name} - ${job.location}. Apply on Job Giver SL! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReport = async () => {
    if (!user || !job || !reportReason.trim()) return;
    await supabase.from('reports').insert({
      reporter_id: user.id,
      resource_type: 'job',
      resource_id: job.id,
      reason: reportReason.trim(),
    });
    toast({ title: 'Report submitted' });
    setShowReport(false);
    setReportReason('');
  };

  const customQuestions = job?.custom_questions || [];

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <p className="text-display mb-2">😕</p>
      <p className="text-subtitle">Job not found</p>
      <Button onClick={() => navigate('/jobs')} className="mt-4">Back to Jobs</Button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-subtitle flex-1 truncate">Job Details</h1>
        <button onClick={handleSave} className="p-2 rounded-full hover:bg-muted">
          <Bookmark className={`h-5 w-5 ${saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="px-4 py-5">
        {/* Company header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground shrink-0">
            {job.companies?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-body-lg font-medium">{job.companies?.name}</span>
              {job.companies?.verification_stage === 'stage_3' && <BadgeCheck className="h-4 w-4 text-primary" />}
            </div>
            {job.companies?.company_location && <p className="text-caption text-muted-foreground">{job.companies.company_location}</p>}
          </div>
        </div>

        <h2 className="text-display">{job.title}</h2>

        <div className="flex flex-wrap gap-3 text-caption text-muted-foreground my-4">
          {job.location && <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full"><MapPin className="h-4 w-4" /> {job.location}</span>}
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full"><Clock className="h-4 w-4" /> {new Date(job.created_at).toLocaleDateString()}</span>
          <Badge variant="secondary">{job.job_type}</Badge>
        </div>

        {job.salary_range && (
          <div className="bg-accent rounded-xl p-4 mb-5">
            <p className="text-caption text-muted-foreground">Salary</p>
            <p className="text-subtitle text-primary">{job.salary_range}</p>
          </div>
        )}

        {job.description && (
          <div className="mb-5">
            <h3 className="text-subtitle mb-2">Description</h3>
            <p className="text-body text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {job.requirements?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-subtitle mb-2">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-body text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Company preview */}
        {job.companies?.description && (
          <div className="mb-5 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-body-lg font-semibold">About {job.companies.name}</h3>
            </div>
            <p className="text-caption text-muted-foreground">{job.companies.description}</p>
          </div>
        )}

        {/* Report */}
        <button onClick={() => setShowReport(true)} className="text-caption text-muted-foreground flex items-center gap-1.5 hover:text-destructive mb-20">
          <Flag className="h-4 w-4" /> Report this job
        </button>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-4 py-3 flex gap-3 z-40">
        <Button onClick={handleWhatsAppShare} variant="outline" className="h-12 rounded-xl shrink-0">
          <Share2 className="h-5 w-5 mr-1.5" /> Share
        </Button>
        <Button onClick={() => setShowApplyDialog(true)} className="h-12 rounded-xl flex-1 text-body-lg font-semibold">
          Apply Now
        </Button>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Apply to {job.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-caption font-semibold mb-1.5 block">Cover Note (optional)</label>
              <Textarea value={coverNote} onChange={e => setCoverNote(e.target.value)} placeholder="Why are you a great fit?" className="rounded-xl min-h-[80px]" />
            </div>

            {customQuestions.map((q: any, i: number) => (
              <div key={i}>
                <label className="text-caption font-semibold mb-1.5 block">{q.question}</label>
                {q.type === 'yesno' ? (
                  <select
                    value={questionAnswers[q.question] || ''}
                    onChange={e => setQuestionAnswers(p => ({ ...p, [q.question]: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-body"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <Input
                    value={questionAnswers[q.question] || ''}
                    onChange={e => setQuestionAnswers(p => ({ ...p, [q.question]: e.target.value }))}
                    placeholder="Your answer..."
                    className="h-11 rounded-xl"
                  />
                )}
              </div>
            ))}

            <Button onClick={handleApply} disabled={applying} className="w-full h-12 rounded-xl font-semibold">
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report Job</DialogTitle></DialogHeader>
          <Textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Describe the issue..." className="min-h-[100px]" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReport(false)}>Cancel</Button>
            <Button onClick={handleReport} variant="destructive">Report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetailPage;
