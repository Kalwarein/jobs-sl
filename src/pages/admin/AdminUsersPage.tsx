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

const AdminUsersPage = () => {
  const { user: adminUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: allRoles } = await supabase.from('user_roles').select('user_id, role');
    
    const roleMap: Record<string, string[]> = {};
    allRoles?.forEach(r => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });
    
    setUsers(profiles || []);
    setRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const logAction = async (action: string, entityType: string, entityId: string) => {
    await supabase.from('audit_logs').insert({
      admin_id: adminUser!.id,
      admin_email: adminUser!.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
    });
  };

  const handleSuspend = async (userId: string, suspend: boolean) => {
    await supabase.from('profiles').update({ is_suspended: suspend }).eq('user_id', userId);
    await logAction(suspend ? 'suspend_user' : 'unsuspend_user', 'user', userId);
    toast({ title: suspend ? 'User suspended' : 'User reinstated' });
    fetchUsers();
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    await supabase.from('user_roles').upsert(
      { user_id: userId, role: newRole as any },
      { onConflict: 'user_id,role' }
    );
    await logAction(`change_role_to_${newRole}`, 'user', userId);
    toast({ title: `Role updated to ${newRole}` });
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display">Users</h1>
        <Badge variant="secondary">{users.length} total</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-10 h-11 rounded-xl" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 text-caption font-semibold">Name</th>
                <th className="text-left p-3 text-caption font-semibold">Email</th>
                <th className="text-left p-3 text-caption font-semibold">Role(s)</th>
                <th className="text-left p-3 text-caption font-semibold">Status</th>
                <th className="p-3 text-caption font-semibold w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{u.full_name || '—'}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(roles[u.user_id] || ['job_seeker']).map(r => (
                        <Badge key={r} variant="secondary" className="text-tiny capitalize">{r.replace('_', ' ')}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {u.is_suspended ? (
                      <Badge className="bg-destructive/15 text-destructive border-0 text-tiny">Suspended</Badge>
                    ) : u.is_deleted ? (
                      <Badge className="bg-muted text-muted-foreground border-0 text-tiny">Deleted</Badge>
                    ) : (
                      <Badge className="bg-success/15 text-success border-0 text-tiny">Active</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.is_suspended ? (
                          <DropdownMenuItem onClick={() => handleSuspend(u.user_id, false)}>Reinstate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspend(u.user_id, true)} className="text-destructive">Suspend</DropdownMenuItem>
                        )}
                        {isSuperAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => handleChangeRole(u.user_id, 'admin')}>Make Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(u.user_id, 'employer')}>Make Employer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(u.user_id, 'job_seeker')}>Reset to Job Seeker</DropdownMenuItem>
                          </>
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
    </div>
  );
};

export default AdminUsersPage;
