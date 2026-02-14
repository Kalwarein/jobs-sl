import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const AdminSettingsPage = () => {
  const { user: adminUser } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ name: '', icon: '📋' });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnn, setNewAnn] = useState({ title: '', message: '' });
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [cats, anns, fl] = await Promise.all([
      supabase.from('job_categories').select('*').order('name'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('feature_flags').select('*').order('key'),
    ]);
    setCategories(cats.data || []);
    setAnnouncements(anns.data || []);
    setFlags(fl.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addCategory = async () => {
    if (!newCat.name.trim()) return;
    await supabase.from('job_categories').insert({ name: newCat.name.trim(), icon: newCat.icon });
    setNewCat({ name: '', icon: '📋' });
    toast({ title: 'Category added' });
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('job_categories').delete().eq('id', id);
    toast({ title: 'Category deleted' });
    fetchData();
  };

  const addAnnouncement = async () => {
    if (!newAnn.title.trim() || !newAnn.message.trim()) return;
    await supabase.from('announcements').insert({
      title: newAnn.title.trim(),
      message: newAnn.message.trim(),
      created_by: adminUser!.id,
    });
    setNewAnn({ title: '', message: '' });
    toast({ title: 'Announcement created' });
    fetchData();
  };

  const toggleAnnouncement = async (id: string, active: boolean) => {
    await supabase.from('announcements').update({ is_active: active }).eq('id', id);
    fetchData();
  };

  const toggleFlag = async (id: string, enabled: boolean) => {
    await supabase.from('feature_flags').update({ enabled, updated_by: adminUser!.id, updated_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-display">Settings</h1>

      {/* Job Categories */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-subtitle mb-4">Job Categories</h2>
        <div className="flex gap-2 mb-4">
          <Input value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} className="w-16 h-10 rounded-lg text-center" placeholder="📋" />
          <Input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} className="flex-1 h-10 rounded-lg" placeholder="Category name" />
          <Button onClick={addCategory} size="sm" className="h-10 rounded-lg"><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-caption">
              <span>{c.icon}</span> {c.name}
              <button onClick={() => deleteCategory(c.id)} className="ml-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-subtitle mb-4">Announcements</h2>
        <div className="space-y-3 mb-4">
          <Input value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="h-10 rounded-lg" />
          <Textarea value={newAnn.message} onChange={e => setNewAnn(p => ({ ...p, message: e.target.value }))} placeholder="Message..." className="rounded-lg" />
          <Button onClick={addAnnouncement} size="sm" className="rounded-lg"><Plus className="h-4 w-4 mr-1" /> Push Announcement</Button>
        </div>
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex-1 min-w-0">
                <p className="text-caption font-semibold truncate">{a.title}</p>
                <p className="text-tiny text-muted-foreground truncate">{a.message}</p>
              </div>
              <Switch checked={a.is_active} onCheckedChange={v => toggleAnnouncement(a.id, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* Feature Flags */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-subtitle mb-4">Feature Flags</h2>
        {flags.length === 0 ? (
          <p className="text-caption text-muted-foreground">No feature flags configured yet.</p>
        ) : (
          <div className="space-y-2">
            {flags.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-caption font-semibold">{f.key}</p>
                  <p className="text-tiny text-muted-foreground">{f.description}</p>
                </div>
                <Switch checked={f.enabled} onCheckedChange={v => toggleFlag(f.id, v)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSettingsPage;
