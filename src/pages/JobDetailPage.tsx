import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, BadgeCheck, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    if (!id) return;
    supabase.from('jobs').select('*, companies(name, is_approved)').eq('id', id).single()
      .then(({ data }) => { setJob(data); setLoading(false); });
  }, [id]);

  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    const { error } = await supabase.from('job_applications').insert({
      job_id: job.id,
      applicant_id: user.id,
    });
    setApplying(false);
    if (error?.code === '23505') {
      toast({ title: 'Already applied', description: 'You have already applied to this job.' });
    } else if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Applied!', description: 'Your application has been submitted.' });
    }
  };

  const handleWhatsAppShare = () => {
    if (!job) return;
    const text = `Check out this job: ${job.title} at ${job.companies?.name} - ${job.location}. Apply on Job Giver SL!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

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
        <button className="p-2 rounded-full hover:bg-muted"><Bookmark className="h-5 w-5 text-muted-foreground" /></button>
      </div>

      <div className="px-4 py-5">
        <h2 className="text-display">{job.title}</h2>
        <div className="flex items-center gap-1.5 mt-2 text-body-lg text-muted-foreground">
          <span className="font-medium">{job.companies?.name}</span>
          {job.companies?.is_approved && <BadgeCheck className="h-5 w-5 text-primary" />}
        </div>

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
          <div className="mb-8">
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
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-4 py-3 flex gap-3 z-40">
        <Button onClick={handleWhatsAppShare} variant="outline" className="h-12 rounded-xl shrink-0">
          <Share2 className="h-5 w-5 mr-1.5" /> Share
        </Button>
        <Button onClick={handleApply} disabled={applying} className="h-12 rounded-xl flex-1 text-body-lg font-semibold">
          {applying ? 'Applying...' : 'Apply Now'}
        </Button>
      </div>
    </div>
  );
};

export default JobDetailPage;
