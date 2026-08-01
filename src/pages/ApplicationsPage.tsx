import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Eye, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { APPLICATION_TYPES, APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/types';
import StatusBadge from '@/components/StatusBadge';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function genAppNumber(prefix: string): string {
  return `${prefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState<string>(APPLICATION_TYPES[0]);
  const [creating, setCreating] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('last_updated', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setApplications(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError(null);
    try {
      const prefix = formName.split(' ')[0].toUpperCase();
      const appNumber = genAppNumber(prefix);
      const { data, error } = await supabase
        .from('applications')
        .insert({
          application_name: formName,
          application_number: appNumber,
          status: 'Submitted' as ApplicationStatus,
          latest_update: 'Application submitted successfully.',
        })
        .select()
        .single();

      if (error) throw error;

      // Add initial timeline entry
      await supabase.from('application_updates').insert({
        application_id: data.id,
        status: 'Submitted',
        note: 'Application submitted successfully.',
      });

      setShowForm(false);
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Application Tracker</h1>
            <p className="mt-2 text-slate-600">Track all your government applications from one place.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            New Application
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading applications…</p>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No applications tracked yet</h3>
            <p className="mt-2 text-sm text-slate-500">Create a new application to start tracking its status.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                <h3 className="font-semibold text-slate-900">{app.application_name}</h3>
                <p className="text-xs text-slate-500 mt-1">{app.application_number}</p>
                <div className="mt-4">
                  <StatusBadge status={app.status} />
                </div>
                <p className="mt-4 text-sm text-slate-600">Last Updated: {formatDate(app.last_updated)}</p>
                <Link
                  to={`/applications/${app.id}`}
                  className="mt-5 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">New Application</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Application Type</label>
                <select
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {APPLICATION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500">
                A unique application number will be generated automatically. Initial status will be set to "Submitted".
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg text-slate-700 font-semibold border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
