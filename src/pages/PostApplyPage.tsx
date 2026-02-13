import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockGigs } from '@/data/mockData';
import { Briefcase, Zap, Plus } from 'lucide-react';

type Tab = 'apply' | 'gigs';

const PostApplyPage = () => {
  const [tab, setTab] = useState<Tab>('apply');

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-title mb-4">Post & Apply</h1>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab('apply')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-caption font-semibold transition-colors ${
              tab === 'apply' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Briefcase className="h-4 w-4" /> Quick Apply
          </button>
          <button
            onClick={() => setTab('gigs')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-caption font-semibold transition-colors ${
              tab === 'gigs' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Zap className="h-4 w-4" /> Freelance Gigs
          </button>
        </div>
      </div>

      {tab === 'apply' && (
        <div className="px-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-subtitle mb-1">Quick Apply</h2>
            <p className="text-caption text-muted-foreground mb-4">
              Upload your CV and apply to jobs with one click
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-caption font-semibold text-foreground mb-1.5 block">Your CV</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-body text-muted-foreground">Tap to upload CV</p>
                  <p className="text-tiny text-muted-foreground mt-1">PDF, DOC up to 5MB</p>
                </div>
              </div>
              <div>
                <label className="text-caption font-semibold text-foreground mb-1.5 block">Cover Note (optional)</label>
                <Textarea placeholder="Brief message to the employer..." className="rounded-xl min-h-[100px] text-body" />
              </div>
              <Button className="w-full h-12 rounded-xl text-body-lg font-semibold" disabled>
                Select a Job to Apply
              </Button>
            </div>
          </div>

          {/* Skill Match */}
          <div className="mt-5 rounded-xl bg-accent p-4 border border-primary/10">
            <p className="text-caption font-semibold text-accent-foreground mb-2">💡 Skill Match</p>
            <p className="text-body text-muted-foreground">
              Complete your profile to see how your skills match available jobs.
            </p>
          </div>
        </div>
      )}

      {tab === 'gigs' && (
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-caption text-muted-foreground">{mockGigs.length} gigs available</p>
            <Button size="sm" className="h-9 rounded-xl text-tiny">
              <Plus className="h-3.5 w-3.5 mr-1" /> Post Gig
            </Button>
          </div>
          {mockGigs.map((gig) => (
            <div key={gig.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-body-lg font-semibold">{gig.title}</h3>
                  <p className="text-caption text-muted-foreground mt-0.5">{gig.postedBy}</p>
                </div>
                <Badge variant="secondary" className="text-tiny shrink-0">{gig.status}</Badge>
              </div>
              <p className="text-body text-muted-foreground mt-2">{gig.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-body font-semibold text-primary">{gig.budget}</span>
                <Button size="sm" variant="outline" className="h-9 rounded-xl text-tiny">
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostApplyPage;
