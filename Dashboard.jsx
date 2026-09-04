import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { BadgeCheck, FileWarning, Gavel, Printer, Plus } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

const NAVY = '#0b1739';

const blotterPill = (s) => ({
  'Pending': 'bg-red-100 text-red-600',
  'Under Investigation': 'bg-red-50 text-red-500',
  'Settled': 'bg-emerald-100 text-emerald-700',
  'Referred to Court': 'bg-red-100 text-red-700',
  'Dismissed': 'bg-slate-200 text-slate-600',
}[s] || 'bg-slate-200 text-slate-600');

const certPill = (s) => ({
  'Pending': 'bg-slate-200 text-slate-600',
  'Issued': 'bg-emerald-100 text-emerald-700',
  'Cancelled': 'bg-slate-200 text-slate-500',
}[s] || 'bg-slate-200 text-slate-600');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function timeAgo(date) {
  try {
    const d = new Date(date);
    const mins = (Date.now() - d.getTime()) / 60000;
    if (mins < 1) return 'Just now';
    return formatDistanceToNowStrict(d) + ' ago';
  } catch {
    return '';
  }
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState({ issuedThisWeek: 0, pendingCerts: 0, activeBlotters: 0 });
  const [reports, setReports] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      base44.auth.me().then(setMe).catch(() => {});
      try {
        const [certs, blotters, announcements, residents] = await Promise.all([
          base44.entities.Certificate.list('-created_date', 100),
          base44.entities.Blotter.list('-created_date', 100),
          base44.entities.Announcement.list('-created_date', 20),
          base44.entities.Resident.list('-created_date', 10),
        ]);

        const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        setStats({
          issuedThisWeek: certs.filter(c => c.status === 'Issued' && c.issue_date && new Date(c.issue_date) >= weekAgo).length,
          pendingCerts: certs.filter(c => c.status === 'Pending').length,
          activeBlotters: blotters.filter(b => b.status === 'Pending' || b.status === 'Under Investigation').length,
        });

        const blotterRows = blotters.map(b => ({
          key: 'blotter-' + b.id,
          id: b.entry_number || 'BL-•••',
          category: b.incident_type,
          subject: `${b.complainant_name} vs. ${b.respondent_name}`,
          date: b.incident_date,
          status: b.status,
          pill: blotterPill(b.status),
          created: b.created_date,
        }));
        const certRows = certs.map(c => ({
          key: 'cert-' + c.id,
          id: c.certificate_number || 'REQ-' + String(c.id).slice(-4).toUpperCase(),
          category: c.certificate_type,
          subject: c.purpose ? `${c.resident_name} — ${c.purpose}` : c.resident_name,
          date: c.issue_date,
          status: c.status,
          pill: certPill(c.status),
          created: c.created_date,
        }));
        setReports([...blotterRows, ...certRows].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 6));

        const acts = [
          ...blotters.map(b => ({
            date: b.created_date, color: 'bg-red-500',
            text: `New blotter report logged — ${b.incident_type} (${b.complainant_name} vs. ${b.respondent_name}).`,
          })),
          ...certs.map(c => ({
            date: c.created_date, color: c.status === 'Issued' ? 'bg-emerald-500' : 'bg-slate-400',
            text: c.status === 'Issued'
              ? `Approved ${c.certificate_type} for ${c.resident_name}.`
              : `Certificate request recorded for ${c.resident_name}.`,
          })),
          ...announcements.map(a => ({
            date: a.created_date, color: 'bg-slate-400',
            text: `Announcement "${a.title}" posted.`,
          })),
          ...residents.map(r => ({
            date: r.created_date, color: 'bg-slate-400',
            text: `${r.first_name} ${r.last_name} registered as a new resident.`,
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivity(acts.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Greeting & actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {greeting()}, {me?.full_name || 'Captain'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's an overview of the barangay's administrative status today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="gap-2 border-slate-300 text-slate-700" onClick={() => window.print()}>
            <Printer style={{ width: 16, height: 16 }} />
            Print Daily Report
          </Button>
          <Button asChild className="gap-2 text-white" style={{ backgroundColor: NAVY }}>
            <Link to="/residents">
              <Plus style={{ width: 16, height: 16 }} />
              New Record
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Certificates Issued</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.issuedThisWeek}</p>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 text-emerald-600">
            <BadgeCheck style={{ width: 22, height: 22 }} />
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Pending Requests</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold text-slate-900">{stats.pendingCerts}</p>
              {stats.pendingCerts > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 px-2.5 py-1 text-xs font-semibold">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Require immediate action</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 text-amber-600">
            <FileWarning style={{ width: 22, height: 22 }} />
          </div>
        </div>
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Active Blotters</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeBlotters}</p>
            <p className="text-xs text-slate-500 mt-1">Currently open cases</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 text-rose-600">
            <Gavel style={{ width: 22, height: 22 }} />
          </div>
        </div>
      </div>

      {/* Reports table + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Critical Reports</h2>
            <Link to="/blotter" className="text-sm font-medium hover:underline" style={{ color: NAVY }}>
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400">No reports yet.</td>
                  </tr>
                ) : reports.map(r => (
                  <tr key={r.key} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{r.id}</td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{r.category}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate">{r.subject}</td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{r.date || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${r.pill}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System activity */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">System Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No recent activity.</p>
            ) : activity.map((a, i) => (
              <div key={i} className="px-5 py-3.5 flex gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.color}`} />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(a.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
