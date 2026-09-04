import React, { useState, useEffect } from 'react';
import {VSCODE } from '@/api/VSCODEClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Megaphone, Pin, Calendar } from 'lucide-react';
import AnnouncementForm from '@/components/forms/AnnouncementForm';
import { useToast } from '@/components/ui/use-toast';

const categoryColors = {
  'General': 'bg-gray-100 text-gray-700',
  'Health': 'bg-red-50 text-red-700',
  'Safety': 'bg-amber-50 text-amber-700',
  'Event': 'bg-purple-50 text-purple-700',
  'Meeting': 'bg-blue-50 text-blue-700',
  'Advisory': 'bg-orange-50 text-orange-700',
  'Program': 'bg-emerald-50 text-emerald-700',
};

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setItems(await vscode.entities.Announcement.list('-date_posted', 200)); }
    catch { toast({ title: 'Failed to load', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(a => catFilter === 'all' || a.category === catFilter);
  const sorted = [...filtered].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

  const handleSave = async (form) => {
    if (editing) {
      await base44.entities.Announcement.update(editing.id, form);
      toast({ title: 'Announcement updated' });
    } else {
      await base44.entities.Announcement.create(form);
      toast({ title: 'Announcement posted' });
    }
    load();
  };

  const handleDelete = async (a) => {
    if (!confirm('Delete this announcement?')) return;
    await vscode.entities.Announcement.delete(a.id);
    toast({ title: 'Announcement deleted' });
    load();
  };

  const togglePin = async (a) => {
    await vscode.entities.Announcement.update(a.id, { is_pinned: !a.is_pinned });
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">{items.length} announcements posted</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus style={{ width: 18, height: 18 }} /> New Announcement
        </Button>
      </div>

      <Select value={catFilter} onValueChange={setCatFilter}>
        <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {['all', 'General', 'Health', 'Safety', 'Event', 'Meeting', 'Advisory', 'Program'].map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone style={{ width: 40, height: 40 }} className="mx-auto mb-3 opacity-40" />
          <p>No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(a => (
            <div key={a.id} className={`rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow ${a.is_pinned ? 'border-primary/40 bg-primary/5' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[a.category] || 'bg-gray-100'}`}>{a.category}</span>
                    {a.is_pinned && <span className="inline-flex items-center gap-1 text-xs text-primary font-medium"><Pin style={{ width: 12, height: 12 }} /> Pinned</span>}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar style={{ width: 12, height: 12 }} /> {a.date_posted ? new Date(a.date_posted).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg">{a.title}</h3>
                  <p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-wrap">{a.content}</p>
                  {a.author && <p className="text-xs text-muted-foreground mt-3">— {a.author}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => togglePin(a)} className={`p-1.5 rounded-lg hover:bg-muted ${a.is_pinned ? 'text-primary' : 'text-muted-foreground'}`} title="Toggle pin"><Pin style={{ width: 16, height: 16 }} /></button>
                  <button onClick={() => { setEditing(a); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><Pencil style={{ width: 16, height: 16 }} /></button>
                  <button onClick={() => handleDelete(a)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 style={{ width: 16, height: 16 }} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnnouncementForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} announcement={editing} />
    </div>
  );
}
