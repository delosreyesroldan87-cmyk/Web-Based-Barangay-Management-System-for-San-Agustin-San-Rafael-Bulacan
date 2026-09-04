import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Landmark, Phone, Briefcase } from 'lucide-react';
import OfficialForm from '@/components/forms/OfficialForm';
import { useToast } from '@/components/ui/use-toast';

const positionOrder = ['Punong Barangay', 'Barangay Kagawad', 'Barangay Secretary', 'Barangay Treasurer', 'SK Chairperson', 'SK Kagawad', 'Chief Tanod', 'Barangay Tanod', 'Lupon Member', 'Utility Worker'];

export default function Officials() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setOfficials(await base44.entities.Official.list('-created_date', 100)); }
    catch { toast({ title: 'Failed to load', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const sorted = [...officials].sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));
  const active = sorted.filter(o => o.status === 'Active');

  const handleSave = async (form) => {
    if (editing) {
      await base44.entities.Official.update(editing.id, form);
      toast({ title: 'Official updated' });
    } else {
      await base44.entities.Official.create(form);
      toast({ title: 'Official added' });
    }
    load();
  };

  const handleDelete = async (o) => {
    if (!confirm(`Remove ${o.name}?`)) return;
    await base44.entities.Official.delete(o.id);
    toast({ title: 'Official removed' });
    load();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Barangay Officials</h1>
          <p className="text-muted-foreground mt-1">{active.length} active officials</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus style={{ width: 18, height: 18 }} /> Add Official
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : officials.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Landmark style={{ width: 40, height: 40 }} className="mx-auto mb-3 opacity-40" />
          <p>No officials added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(o => (
            <div key={o.id} className={`rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow ${o.status === 'Inactive' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xl font-bold shadow-sm">
                  {o.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(o); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><Pencil style={{ width: 16, height: 16 }} /></button>
                  <button onClick={() => handleDelete(o)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 style={{ width: 16, height: 16 }} /></button>
                </div>
              </div>
              <p className="font-semibold mt-3">{o.name}</p>
              <p className="text-sm text-primary font-medium">{o.position}</p>
              {o.committee && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Briefcase style={{ width: 12, height: 12 }} /> {o.committee}</p>}
              {o.contact_number && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone style={{ width: 12, height: 12 }} /> {o.contact_number}</p>}
              {o.term_start && <p className="text-xs text-muted-foreground mt-2">{new Date(o.term_start).getFullYear()}–{o.term_end ? new Date(o.term_end).getFullYear() : 'Present'}</p>}
              {o.status === 'Inactive' && <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs mt-2">Inactive</span>}
            </div>
          ))}
        </div>
      )}

      <OfficialForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} official={editing} />
    </div>
  );
}
