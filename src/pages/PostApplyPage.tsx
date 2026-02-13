import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Zap, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Tab = 'apply' | 'gigs';

const PostApplyPage = () => {
  const [tab, setTab] = useState<Tab>('apply');
  const [gigs, setGigs] = useState<any[]>([]);
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('gigs').select('*').eq('is_approved', true).order('created_at', { ascending: false })
      .then(({ data }) => setGigs(data || []));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-title mb-4">Post & Apply</h1>

        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab('apply')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-caption font-semibold transition-colors ${tab === 'apply' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Briefcase className="h-4 w-4" /> Quick Apply
          </button>
          <button onClick={() => setTab('gigs')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-caption font-semibold transition-colors ${tab === 'gigs' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Zap className="h-4 w-4" /> Freelance Gigs
          </button>
        </div>
      </div>

      {tab === 'apply' && (
        <div className="px-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-subtitle mb-1">Quick Apply</h2>
            <p className="text-caption text-muted-foreground mb-4">Browse jobs and apply with one click</p>
            <Button onClick={() => navigate('/jobs')} className="w-full h-12 rounded-xl text-body-lg font-semibold">
              Browse Available Jobs
            </Button>
          </div>

          {(role === 'employer' || role === 'admin') && (
            <div className="mt-4 rounded-xl bg-accent p-4 border border-primary/10">
              <p className="text-caption font-semibold text-accent-foreground">🏢 Employer Actions</p>
              <p className="text-body text-muted-foreground mt-1">Post jobs for your approved company.</p>
              <Button onClick={() => navigate('/post-job')} className="mt-3 h-11 rounded-xl" size="sm">
                Post a Job
              </Button>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-accent p-4 border border-primary/10">
            <p className="text-caption font-semibold text-accent-foreground">💡 Skill Match</p>
            <p className="text-body text-muted-foreground mt-1">Complete your profile to see how your skills match available jobs.</p>
          </div>
        </div>
      )}

      {tab === 'gigs' && (
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-caption text-muted-foreground">{gigs.length} gigs available</p>
          </div>
          {gigs.length === 0 ? (
            <div className="rounded-xl bg-muted p-8 text-center">
              <p className="text-display mb-2">🎯</p>
              <p className="text-body text-muted-foreground">No gigs yet. Check back soon!</p>
            </div>
          ) : (
            gigs.map((gig) => (
              <div key={gig.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-body-lg font-semibold">{gig.title}</h3>
                <p className="text-body text-muted-foreground mt-1">{gig.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-body font-semibold text-primary">{gig.budget}</span>
                  <Button size="sm" variant="outline" className="h-9 rounded-xl text-tiny">Apply</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PostApplyPage;
