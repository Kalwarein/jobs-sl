import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/JobCard';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const filters = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

const JobsPage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      let query = supabase.from('jobs').select('*, companies(name, is_approved)').eq('is_approved', true);
      if (activeFilter !== 'All') query = query.eq('job_type', activeFilter);
      const { data } = await query.order('created_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    fetchJobs();
  }, [activeFilter]);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.companies?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 pb-3 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-title flex-1">Jobs</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="pl-11 h-11 rounded-xl text-body" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1 -mx-4 px-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-caption font-medium transition-colors ${
                activeFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <p className="text-caption text-muted-foreground">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
        {loading ? (
          <div className="py-12 text-center"><div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-display mb-2">🔍</p>
            <p className="text-subtitle text-muted-foreground">No jobs found</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={{
                id: job.id, title: job.title, company: job.companies?.name || 'Unknown',
                location: job.location || '', type: job.job_type || 'Full-time', category: '',
                salary: job.salary_range, description: job.description, requirements: job.requirements || [],
                postedAt: new Date(job.created_at).toLocaleDateString(),
                isVerified: job.companies?.is_approved || false,
                isFeatured: job.is_featured || false, status: job.status || 'pending',
              }}
              onTap={() => navigate(`/jobs/${job.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JobsPage;
