import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, ChevronDown, ChevronUp, BadgeCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const stageLabels: Record<string, string> = {
  stage_1: 'Stage 1: Basic',
  stage_2: 'Stage 2: Verified',
  stage_3: 'Stage 3: Trusted',
};

const stageColors: Record<string, string> = {
  stage_1: 'bg-[hsl(var(--info))]/15 text-[hsl(var(--info))]',
  stage_2: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]',
  stage_3: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]',
};

const AdminCompaniesPage = () => {
  const { user: adminUser } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState<{ id: string; notes: string } | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; reason: string } | null>(null);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    setCompanies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const logAction = async (action: string, entityId: string, details?: any) => {
    await supabase.from('audit_logs').insert({
      admin_id: adminUser!.id, admin_email: adminUser!.email,
      action, entity_type: 'company', entity_id: entityId,
      details: details || {},
    });
  };

  const handleApprove = async (id: string) => {
    await supabase.from('companies').update({
      is_approved: true,
      approved_by: adminUser!.id,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
      verification_stage: 'stage_2',
    }).eq('id', id);
    await logAction('approve_company', id);
    toast({ title: 'Company approved — Stage 2 unlocked' });
    fetchCompanies();
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    await supabase.from('companies').update({
      is_approved: false,
      rejection_reason: rejectDialog.reason,
    }).eq('id', rejectDialog.id);
    await logAction('reject_company', rejectDialog.id, { reason: rejectDialog.reason });
    toast({ title: 'Company rejected with feedback' });
    setRejectDialog(null);
    fetchCompanies();
  };

  const handleStageChange = async (id: string, stage: string) => {
    const updates: any = { verification_stage: stage };
    if (stage === 'stage_3') updates.trust_level = 'trusted';
    await supabase.from('companies').update(updates).eq('id', id);
    await logAction(`upgrade_to_${stage}`, id);
    toast({ title: `Company upgraded to ${stageLabels[stage]}` });
    fetchCompanies();
  };

  const handleSaveNotes = async () => {
    if (!noteDialog) return;
    await supabase.from('companies').update({ admin_notes: noteDialog.notes }).eq('id', noteDialog.id);
    toast({ title: 'Notes saved' });
    setNoteDialog(null);
    fetchCompanies();
  };

  const handleSuspend = async (id: string, suspend: boolean) => {
    await supabase.from('companies').update({ is_suspended: suspend }).eq('id', id);
    await logAction(suspend ? 'suspend_company' : 'unsuspend_company', id);
    toast({ title: suspend ? 'Company suspended' : 'Company reinstated' });
    fetchCompanies();
  };

  const handleRevokeApproval = async (id: string) => {
    await supabase.from('companies').update({ is_approved: false, verification_stage: 'stage_1', trust_level: 'basic' }).eq('id', id);
    await logAction('revoke_approval', id);
    toast({ title: 'Company approval revoked' });
    fetchCompanies();
  };

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display">Companies</h1>
        <Badge variant="secondary">{companies.length} total</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="pl-10 h-11 rounded-xl" />
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-body-lg font-semibold">{c.name}</h3>
                  {c.is_approved && <BadgeCheck className="h-4 w-4 text-primary" />}
                  {c.is_suspended && <Badge className="bg-destructive/15 text-destructive border-0 text-tiny">Suspended</Badge>}
                </div>
                <p className="text-caption text-muted-foreground">{c.contact_email} • {c.location}</p>
              </div>
              <Badge className={`${stageColors[c.verification_stage || 'stage_1']} border-0 text-tiny shrink-0`}>
                {stageLabels[c.verification_stage || 'stage_1']}
              </Badge>
              {expanded === c.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expanded === c.id && (
              <div className="border-t border-border p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-caption">
                  <div><span className="text-muted-foreground">Phone:</span> {c.contact_phone || '—'}</div>
                  <div><span className="text-muted-foreground">Website:</span> {c.website || '—'}</div>
                  <div><span className="text-muted-foreground">Business Type:</span> {c.business_type || '—'}</div>
                  <div><span className="text-muted-foreground">Industry:</span> {c.industry || '—'}</div>
                  <div><span className="text-muted-foreground">Contact Person:</span> {c.contact_person_name || '—'}</div>
                  <div><span className="text-muted-foreground">ID Type:</span> {c.contact_person_id_type || '—'}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Description:</span> {c.description || '—'}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Reason:</span> {c.reason_for_joining || '—'}</div>
                </div>

                {c.rejection_reason && (
                  <div className="rounded-lg bg-destructive/10 p-3">
                    <p className="text-tiny font-semibold text-destructive">Rejection Reason</p>
                    <p className="text-caption text-muted-foreground mt-1">{c.rejection_reason}</p>
                  </div>
                )}

                {c.admin_notes && (
                  <div className="rounded-lg bg-warning/10 p-3">
                    <p className="text-tiny font-semibold text-[hsl(var(--warning))]">Admin Notes</p>
                    <p className="text-caption text-muted-foreground mt-1">{c.admin_notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {!c.is_approved && (
                    <>
                      <Button onClick={() => handleApprove(c.id)} size="sm" className="h-9 rounded-lg">Approve</Button>
                      <Button onClick={() => setRejectDialog({ id: c.id, reason: '' })} size="sm" variant="outline" className="h-9 rounded-lg text-destructive">Reject</Button>
                    </>
                  )}
                  {c.is_approved && (
                    <Button onClick={() => handleRevokeApproval(c.id)} size="sm" variant="outline" className="h-9 rounded-lg text-destructive">Revoke Approval</Button>
                  )}
                  
                  {c.is_approved && c.verification_stage !== 'stage_3' && (
                    <Button onClick={() => handleStageChange(c.id, 'stage_3')} size="sm" variant="outline" className="h-9 rounded-lg">→ Trusted Employer</Button>
                  )}
                  
                  <Button onClick={() => setNoteDialog({ id: c.id, notes: c.admin_notes || '' })} size="sm" variant="outline" className="h-9 rounded-lg">Notes</Button>
                  
                  {c.is_suspended ? (
                    <Button onClick={() => handleSuspend(c.id, false)} size="sm" variant="outline" className="h-9 rounded-lg">Reinstate</Button>
                  ) : (
                    <Button onClick={() => handleSuspend(c.id, true)} size="sm" variant="outline" className="h-9 rounded-lg text-destructive">Suspend</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Admin Notes</DialogTitle></DialogHeader>
          <Textarea
            value={noteDialog?.notes || ''}
            onChange={e => setNoteDialog(prev => prev ? { ...prev, notes: e.target.value } : null)}
            placeholder="Internal notes about this company..."
            className="min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Company</DialogTitle></DialogHeader>
          <p className="text-caption text-muted-foreground">Provide a reason that will be shown to the applicant.</p>
          <Textarea
            value={rejectDialog?.reason || ''}
            onChange={e => setRejectDialog(prev => prev ? { ...prev, reason: e.target.value } : null)}
            placeholder="Reason for rejection..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button onClick={handleReject} variant="destructive">Reject</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompaniesPage;
