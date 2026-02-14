import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, Briefcase, Zap, Flag, Clock, BadgeCheck, AlertTriangle } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalCompanies: number;
  pendingCompanies: number;
  verifiedCompanies: number;
  liveJobs: number;
  pendingJobs: number;
  totalGigs: number;
  pendingGigs: number;
  totalReports: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalCompanies: 0, pendingCompanies: 0, verifiedCompanies: 0,
    liveJobs: 0, pendingJobs: 0, totalGigs: 0, pendingGigs: 0, totalReports: 0,
  });
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [users, companies, jobs, gigs, reports, actions] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id, is_approved'),
        supabase.from('jobs').select('id, is_approved'),
        supabase.from('gigs').select('id, is_approved'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const companiesData = companies.data || [];
      const jobsData = jobs.data || [];
      const gigsData = gigs.data || [];

      setStats({
        totalUsers: users.count || 0,
        totalCompanies: companiesData.length,
        pendingCompanies: companiesData.filter(c => !c.is_approved).length,
        verifiedCompanies: companiesData.filter(c => c.is_approved).length,
        liveJobs: jobsData.filter(j => j.is_approved).length,
        pendingJobs: jobsData.filter(j => !j.is_approved).length,
        totalGigs: gigsData.length,
        pendingGigs: gigsData.filter(g => !g.is_approved).length,
        totalReports: reports.count || 0,
      });
      setRecentActions(actions.data || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const widgets = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-info' },
    { label: 'Total Companies', value: stats.totalCompanies, icon: Building2, color: 'text-primary' },
    { label: 'Pending Companies', value: stats.pendingCompanies, icon: Clock, color: 'text-warning' },
    { label: 'Verified Companies', value: stats.verifiedCompanies, icon: BadgeCheck, color: 'text-success' },
    { label: 'Live Jobs', value: stats.liveJobs, icon: Briefcase, color: 'text-primary' },
    { label: 'Pending Jobs', value: stats.pendingJobs, icon: Clock, color: 'text-warning' },
    { label: 'Freelance Gigs', value: stats.totalGigs, icon: Zap, color: 'text-accent-foreground' },
    { label: 'Pending Gigs', value: stats.pendingGigs, icon: Clock, color: 'text-warning' },
    { label: 'Open Reports', value: stats.totalReports, icon: Flag, color: 'text-destructive' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-display mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {widgets.map((w) => (
          <div key={w.label} className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${w.color}`}>
              <w.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-display">{w.value}</p>
              <p className="text-caption text-muted-foreground">{w.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-subtitle mb-4">Recent Activity</h2>
        {recentActions.length === 0 ? (
          <p className="text-body text-muted-foreground">No recent admin actions.</p>
        ) : (
          <div className="space-y-3">
            {recentActions.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-body border-b border-border pb-3 last:border-0">
                <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.action} — {a.entity_type}</p>
                  <p className="text-tiny text-muted-foreground">{a.admin_email} • {new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
