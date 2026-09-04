import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, FileText, Printer } from 'lucide-react';
import CertificateForm from '@/components/forms/CertificateForm';
import { SEAL_URL } from '@/components/Seal';
import { useToast } from '@/components/ui/use-toast';

const statusColors = {
  'Pending': 'bg-amber-50 text-amber-700',
  'Issued': 'bg-emerald-50 text-emerald-700',
  'Cancelled': 'bg-red-50 text-red-700',
};

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setCerts(await base44.entities.Certificate.list('-created_date', 500)); }
    catch { toast({ title: 'Failed to load', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = certs.filter(c => {
    const matchSearch = !search || (c.resident_name || '').toLowerCase().includes(search.toLowerCase()) || (c.certificate_number || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.certificate_type === typeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleSave = async (form) => {
    if (editing) {
      await base44.entities.Certificate.update(editing.id, form);
      toast({ title: 'Certificate updated' });
    } else {
      const num = `BA-SA-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      await base44.entities.Certificate.create({ ...form, certificate_number: form.certificate_number || num });
      toast({ title: 'Certificate issued' });
    }
    load();
  };

  const handleDelete = async (c) => {
    if (!confirm('Delete this certificate record?')) return;
    await base44.entities.Certificate.delete(c.id);
    toast({ title: 'Certificate deleted' });
    load();
  };

  const printCert = (c) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${c.certificate_type}</title><style>
      body{font-family:Georgia,serif;padding:60px;text-align:center;color:#222}
      .seal{width:90px;height:90px;border:3px solid #15803d;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#15803d}
      h1{font-size:22px;margin:0 0 4px} h2{font-size:14px;font-weight:normal;margin:0 0 30px}
      .body{font-size:15px;line-height:2;text-align:justify;max-width:600px;margin:0 auto}
      .name{font-weight:bold;font-size:18px;text-transform:uppercase}
      .sign{margin-top:60px} .line{border-top:1px solid #333;width:250px;margin:0 auto 8px}
      .small{font-size:13px;color:#555}
    </style></head><body>
      <img src="${SEAL_URL}" style="width:110px;height:110px;margin:0 auto 24px;display:block;object-fit:contain" />
      <h1>REPUBLIC OF THE PHILIPPINES</h1>
      <h2>Barangay San Agustin, San Rafael, Bulacan</h2>
      <h1 style="margin-top:20px">${c.certificate_type.toUpperCase()}</h1>
      <div class="body"><p>TO WHOM IT MAY CONCERN:</p>
      <p>This is to certify that <span class="name">${c.resident_name}</span>${c.resident_address ? `, a resident of ${c.resident_address}` : ''}, is a bona fide resident of this barangay.</p>
      <p>This certification is issued upon request of the above-named person for <strong>${c.purpose || 'legal purposes'}</strong>.</p>
      <p>Issued on ${new Date(c.issue_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} at Barangay San Agustin, San Rafael, Bulacan.</p>
      <div class="sign"><div class="line"></div><div class="small">PUNONG BARANGAY</div></div>
      <p class="small">Cert. No.: ${c.certificate_number || 'N/A'} ${c.or_number ? `| OR No.: ${c.or_number}` : ''}</p>
    </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Certificates</h1>
          <p className="text-muted-foreground mt-1">{certs.length} certificate records</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus style={{ width: 18, height: 18 }} /> Issue Certificate
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search style={{ width: 18, height: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or cert number..." className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-52"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {['Barangay Clearance', 'Certificate of Residency', 'Certificate of Indigency', 'Certificate of Good Moral Character', 'Business Permit Clearance', 'Certificate of No Income'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['all', 'Pending', 'Issued', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText style={{ width: 40, height: 40 }} className="mx-auto mb-3 opacity-40" />
          <p>No certificates found.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Cert. No.</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Date Issued</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{c.certificate_number || '—'}</td>
                    <td className="px-4 py-3"><p className="font-medium">{c.resident_name}</p><p className="text-xs text-muted-foreground md:hidden">{c.certificate_type}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.certificate_type}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-PH') : '—'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => printCert(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary" title="Print"><Printer style={{ width: 16, height: 16 }} /></button>
                        <button onClick={() => { setEditing(c); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><Pencil style={{ width: 16, height: 16 }} /></button>
                        <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 style={{ width: 16, height: 16 }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CertificateForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} certificate={editing} />
    </div>
  );
}
