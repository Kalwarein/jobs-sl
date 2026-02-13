import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ApplicationsPage = () => {
  const { user, role } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch user's applications
    supabase.from('job_applications').select('*, jobs(title, companies(name))')
      .eq('applicant_id', user.id).order('applied_at', { ascending: false })
      .then(({ data }) => { setApplications(data || []); setLoading(false); });

    // If employer, fetch their posted jobs
    if (role === 'employer' || role === 'admin') {
      supabase.from('jobs').select('*, companies(name)').eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setMyJobs(data || []));
    }
  }, [user, role]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-title mb-1">Applications</h1>
      </div>

      {/* Employer: My Posted Jobs */}
      {myJobs.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-subtitle mb-3">My Posted Jobs</h2>
          <div className="space-y-3">
            {myJobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-body-lg font-semibold">{job.title}</h3>
                    <p className="text-caption text-muted-foreground">{job.companies?.name}</p>
                  </div>
                  <StatusBadge status={job.is_approved ? 'shortlisted' : 'submitted'} />
                </div>
                <p className="text-tiny text-muted-foreground mt-2">
                  {job.is_approved ? '✅ Live' : '⏳ Pending approval'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Seeker: My Applications */}
      <div className="px-4">
        <h2 className="text-subtitle mb-3">My Applications</h2>
        {applications.length === 0 ? (
          <div className="rounded-xl bg-muted p-8 text-center">
            <p className="text-display mb-2">📋</p>
            <p className="text-body text-muted-foreground">No applications yet. Start applying to jobs!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <button key={app.id} className="w-full text-left rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <h3 className="text-body-lg font-semibold truncate">{app.jobs?.title}</h3>
                  <p className="text-caption text-muted-foreground">{app.jobs?.companies?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={app.status as any} />
                    <span className="text-tiny text-muted-foreground">• {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
