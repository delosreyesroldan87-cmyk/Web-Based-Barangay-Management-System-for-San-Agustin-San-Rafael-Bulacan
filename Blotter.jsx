import React, { useState, useEffect } from 'react';
import { VSCODE } from '@/api/vscodeClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, ScrollText, AlertTriangle } from 'lucide-react';
import BlotterForm from '@/components/forms/BlotterForm';
import { useToast } from '@/components/ui/use-toast';

const statusColors = {
  'Pending': 'bg-amber-50 text-amber-700',
  'Under Investigation': 'bg-blue-50 text-blue-700',
  'Settled': 'bg-emerald-50 text-emerald-700',
  'Referred to Court': 'bg-red-50 text-red-700',
  'Dismissed': 'bg-gray-100 text-gray-600',
};

export default function Blotter() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setEntries(await vscode.entities.Blotter.list('-created_date', 500)); }
    catch { toast({ title: 'Failed to load', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(b => {
    const matchSearch = !search || (b.complainant_name || '').toLowerCase().includes(search.toLowerCase()) || (b.respondent_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async (form) => {
    if (editing) {
      await vscode.entities.Blotter.update(editing.id, form);
      toast({ title: 'Entry updated' });
    } else {
      const num = `BLT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      await base44.entities.Blotter.create({ ...form, entry_number: form.entry_number || num });
      toast({ title: 'Blotter entry recorded' });
    }
    load();
  };

  const handleDelete = async (b) => {
    if (!confirm('Delete this blotter entry?')) return;
    await base44.entities.Blotter.delete(b.id);
    toast({ title: 'Entry deleted' });
    load();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Blotter Records</h1>
          <p className="text-muted-foreground mt-1">{entries.length} incident records</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus style={{ width: 18, height: 18 }} /> New Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search style={{ width: 18, height: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complainant or respondent..." className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['all', 'Pending', 'Under Investigation', 'Settled', 'Referred to Court', 'Dismissed'].map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ScrollText style={{ width: 40, height: 40 }} className="mx-auto mb-3 opacity-40" />
          <p>No blotter records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <AlertTriangle style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{b.complainant_name} <span className="text-muted-foreground font-normal">vs.</span> {b.respondent_name}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{b.entry_number} · {b.incident_type} · {b.incident_date} {b.incident_time && `at ${b.incident_time}`}</p>
                    {b.location && <p className="text-xs text-muted-foreground mt-0.5">📍 {b.location}</p>}
                    <p className="text-sm mt-2 text-foreground/80 line-clamp-2">{b.description}</p>
                    {b.resolution && <p className="text-sm mt-2 text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2"><strong>Resolution:</strong> {b.resolution}</p>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(b); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><Pencil style={{ width: 16, height: 16 }} /></button>
                  <button onClick={() => handleDelete(b)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 style={{ width: 16, height: 16 }} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BlotterForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} blotter={editing} />
    </div>
  );
}
