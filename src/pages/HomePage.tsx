import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/JobCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const HomePage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('job_categories').select('*').then(({ data }) => setCategories(data || []));
    supabase.from('jobs').select('*, companies(name, is_approved)').eq('is_approved', true).limit(5).then(({ data }) => setFeaturedJobs(data || []));
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary px-4 pb-8 pt-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-primary-foreground/70 text-body">Good morning 👋</p>
            <h1 className="text-title text-primary-foreground">{firstName}</h1>
          </div>
          <button className="relative p-2 rounded-full bg-primary-foreground/10">
            <Bell className="h-6 w-6 text-primary-foreground" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search jobs, companies, skills..." className="pl-11 h-12 rounded-xl bg-card border-0 text-body shadow-lg" />
        </div>
      </div>

      <div className="px-4 -mt-1">
        {/* Announcement */}
        <div className="mt-5 rounded-xl bg-accent p-4 border border-primary/10">
          <p className="text-caption font-semibold text-accent-foreground">📢 Announcement</p>
          <p className="text-body text-muted-foreground mt-1">
            Government Youth Employment Programme now accepting applications. Apply before March 2026!
          </p>
        </div>

        {/* Categories */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-subtitle">Job Categories</h2>
            <button className="text-caption text-primary font-semibold">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate('/jobs')}
                className="flex flex-col items-center gap-1.5 min-w-[4.5rem] rounded-xl bg-card border border-border p-3 hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-tiny text-foreground whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Jobs */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-subtitle">Recent Jobs</h2>
            <button onClick={() => navigate('/jobs')} className="text-caption text-primary font-semibold">
              View All
            </button>
          </div>
          {featuredJobs.length === 0 ? (
            <div className="rounded-xl bg-muted p-6 text-center">
              <p className="text-body text-muted-foreground">No jobs posted yet. Be the first employer!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.id,
                    title: job.title,
                    company: job.companies?.name || 'Unknown',
                    location: job.location || '',
                    type: job.job_type || 'Full-time',
                    category: '',
                    salary: job.salary_range,
                    description: job.description,
                    requirements: job.requirements || [],
                    postedAt: new Date(job.created_at).toLocaleDateString(),
                    isVerified: job.companies?.is_approved || false,
                    isFeatured: job.is_featured || false,
                    status: job.status || 'pending',
                  }}
                  onTap={() => navigate(`/jobs/${job.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Freelance Highlight */}
        <div className="mt-6 mb-4">
          <h2 className="text-subtitle mb-3">Freelance & Gigs</h2>
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-body font-semibold text-foreground">🎯 Browse freelance gigs</p>
            <p className="text-caption text-muted-foreground mt-1">
              Website design, photography, translation and more.
            </p>
            <Button onClick={() => navigate('/post')} className="mt-3 h-11 rounded-xl text-body" size="sm">
              Browse Gigs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
