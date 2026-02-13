import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/JobCard';
import { mockJobs, mockCategories } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const filters = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

const JobsPage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || job.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 pb-3 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-title flex-1">Jobs</h1>
          <button className="p-2.5 rounded-xl border border-border hover:bg-muted">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="pl-11 h-11 rounded-xl text-body"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1 -mx-4 px-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-caption font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 space-y-3">
        <p className="text-caption text-muted-foreground">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </p>
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} onTap={() => navigate(`/jobs/${job.id}`)} />
        ))}
        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-display mb-2">🔍</p>
            <p className="text-subtitle text-muted-foreground">No jobs found</p>
            <p className="text-body text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
