import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ClipboardList } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { APPLICATION_STATUSES, type Application, type ApplicationStatus, type ApplicationUpdate } from '@/types';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [updates, setUpdates] = useState<ApplicationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Submitted');
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const [appRes, updatesRes] = await Promise.all([
      supabase.from('applications').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('application_updates')
        .select('*')
        .eq('application_id', id)
        .order('created_at', { ascending: true }),
    ]);

    if (appRes.error) {
      setError(appRes.error.message);
      setLoading(false);
      return;
    }
    if (updatesRes.error) {
      setError(updatesRes.error.message);
      setLoading(false);
      return;
    }
    if (!appRes.data) {
      setError('Application not found.');
      setLoading(false);
      return;
    }

    setApplication(appRes.data as Application);
    setUpdates(updatesRes.data ?? []);
    setNewStatus((appRes.data as Application).status);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !id) return;
    setUpdating(true);
    setError(null);

    try {
      const { error: appError } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          latest_update: newNote || `Status changed to "${newStatus}".`,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id);

      if (appError) throw appError;

      const { error: updateError } = await supabase.from('application_updates').insert({
        application_id: id,
        status: newStatus,
        note: newNote || null,
      });

      if (updateError) throw updateError;

      setNewNote('');
      await fetchDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading application…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Application not found</h1>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <Link to="/applications" className="mt-6 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">{application.application_name}</h1>
              </div>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Application Number</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{application.application_number}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Submitted Date</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{formatDateTime(application.submitted_date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Current Status</dt>
                  <dd className="mt-1"><StatusBadge status={application.status} /></dd>
                </div>
                <div>
                  <dt className="text-slate-500">Latest Update</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{application.latest_update ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Last Updated</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{formatDateTime(application.last_updated)}</dd>
                </div>
              </dl>
            </div>

            {/* Update status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-6">
              <h2 className="font-semibold text-slate-900 mb-4">Update Status</h2>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Note (optional)</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Add a note about this status change…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {updating ? 'Updating…' : 'Update Status'}
                </button>
              </form>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-6">Timeline</h2>
              {updates.length === 0 ? (
                <p className="text-sm text-slate-500">No updates recorded yet.</p>
              ) : (
                <ol className="relative">
                  {updates.map((u, idx) => {
                    const isLast = idx === updates.length - 1;
                    return (
                      <li key={u.id} className="flex gap-4 pb-8 last:pb-0 relative">
                        {!isLast && (
                          <span className="absolute left-3.5 top-7 bottom-0 w-px bg-slate-200" />
                        )}
                        <div className="relative z-10 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <span className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={u.status} />
                            <span className="text-xs text-slate-500">{formatDateTime(u.created_at)}</span>
                          </div>
                          {u.note && <p className="mt-2 text-sm text-slate-600">{u.note}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
