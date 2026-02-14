import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminReportsPage = () => {
  const { user: adminUser } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [r, a] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setReports(r.data || []);
    setAuditLogs(a.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleResolve = async (id: string) => {
    await supabase.from('reports').update({
      status: 'resolved',
      resolved_by: adminUser!.id,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
    await supabase.from('audit_logs').insert({
      admin_id: adminUser!.id, admin_email: adminUser!.email,
      action: 'resolve_report', entity_type: 'report', entity_id: id,
    });
    toast({ title: 'Report resolved' });
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-display mb-6">Reports & Audit</h1>

      <Tabs defaultValue="reports">
        <TabsList className="mb-4">
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs ({auditLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-body text-muted-foreground text-center py-8">No reports</p>
            ) : reports.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-body font-semibold capitalize">{r.resource_type} Report</p>
                    <p className="text-caption text-muted-foreground">{r.reason}</p>
                  </div>
                  <Badge className={`border-0 text-tiny ${r.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}`}>
                    {r.status}
                  </Badge>
                </div>
                {r.description && <p className="text-caption text-muted-foreground mb-3">{r.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-tiny text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  {r.status === 'pending' && (
                    <Button size="sm" className="h-8 text-tiny" onClick={() => handleResolve(r.id)}>Resolve</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 text-caption font-semibold">Action</th>
                    <th className="text-left p-3 text-caption font-semibold">Entity</th>
                    <th className="text-left p-3 text-caption font-semibold">Admin</th>
                    <th className="text-left p-3 text-caption font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(a => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium capitalize">{a.action?.replace(/_/g, ' ')}</td>
                      <td className="p-3 text-muted-foreground capitalize">{a.entity_type}</td>
                      <td className="p-3 text-muted-foreground">{a.admin_email || '—'}</td>
                      <td className="p-3 text-tiny text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
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

export default AdminReportsPage;
