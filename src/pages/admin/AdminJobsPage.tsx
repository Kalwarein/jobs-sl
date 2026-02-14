import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminJobsPage = () => {
  const { user: adminUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [gigs, setGigs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [j, g] = await Promise.all([
      supabase.from('jobs').select('*, companies(name)').order('created_at', { ascending: false }),
      supabase.from('gigs').select('*').order('created_at', { ascending: false }),
    ]);
    setJobs(j.data || []);
    setGigs(g.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const logAction = async (action: string, type: string, id: string) => {
    await supabase.from('audit_logs').insert({
      admin_id: adminUser!.id, admin_email: adminUser!.email,
      action, entity_type: type, entity_id: id,
    });
  };

  const handleJobAction = async (id: string, action: 'approve' | 'reject' | 'feature' | 'unfeature') => {
    const updates: any = {};
    if (action === 'approve') { updates.is_approved = true; updates.approved_by = adminUser!.id; updates.approved_at = new Date().toISOString(); }
    if (action === 'reject') { updates.is_approved = false; }
    if (action === 'feature') { updates.is_featured = true; }
    if (action === 'unfeature') { updates.is_featured = false; }

    await supabase.from('jobs').update(updates).eq('id', id);
    await logAction(`${action}_job`, 'job', id);
    toast({ title: `Job ${action}d` });
    fetchData();
  };

  const handleGigAction = async (id: string, approve: boolean) => {
    await supabase.from('gigs').update({
      is_approved: approve,
      ...(approve ? { approved_by: adminUser!.id, approved_at: new Date().toISOString() } : {}),
    }).eq('id', id);
    await logAction(approve ? 'approve_gig' : 'reject_gig', 'gig', id);
    toast({ title: approve ? 'Gig approved' : 'Gig rejected' });
    fetchData();
  };

  const filteredJobs = jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredGigs = gigs.filter(g => g.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-display mb-6">Jobs & Gigs</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10 h-11 rounded-xl" />
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="gigs">Gigs ({gigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 text-caption font-semibold">Title</th>
                    <th className="text-left p-3 text-caption font-semibold">Company</th>
                    <th className="text-left p-3 text-caption font-semibold">Status</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(j => (
                    <tr key={j.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{j.title}</div>
                        <div className="text-tiny text-muted-foreground">{j.location} • {j.job_type}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{j.companies?.name || '—'}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {j.is_approved ? (
                            <Badge className="bg-success/15 text-success border-0 text-tiny">Live</Badge>
                          ) : (
                            <Badge className="bg-warning/15 text-warning border-0 text-tiny">Pending</Badge>
                          )}
                          {j.is_featured && <Badge className="bg-primary/15 text-primary border-0 text-tiny">Featured</Badge>}
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!j.is_approved && <DropdownMenuItem onClick={() => handleJobAction(j.id, 'approve')}>Approve</DropdownMenuItem>}
                            {j.is_approved && <DropdownMenuItem onClick={() => handleJobAction(j.id, 'reject')} className="text-destructive">Reject / Hide</DropdownMenuItem>}
                            {!j.is_featured ? (
                              <DropdownMenuItem onClick={() => handleJobAction(j.id, 'feature')}>Feature</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleJobAction(j.id, 'unfeature')}>Unfeature</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gigs">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 text-caption font-semibold">Title</th>
                    <th className="text-left p-3 text-caption font-semibold">Budget</th>
                    <th className="text-left p-3 text-caption font-semibold">Status</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGigs.map(g => (
                    <tr key={g.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{g.title}</td>
                      <td className="p-3 text-muted-foreground">{g.budget || '—'}</td>
                      <td className="p-3">
                        {g.is_approved ? (
                          <Badge className="bg-success/15 text-success border-0 text-tiny">Live</Badge>
                        ) : (
                          <Badge className="bg-warning/15 text-warning border-0 text-tiny">Pending</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {!g.is_approved && <Button size="sm" className="h-7 text-tiny" onClick={() => handleGigAction(g.id, true)}>Approve</Button>}
                          {g.is_approved && <Button size="sm" variant="outline" className="h-7 text-tiny text-destructive" onClick={() => handleGigAction(g.id, false)}>Reject</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminJobsPage;
