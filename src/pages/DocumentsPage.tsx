import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Eye, Trash2, FileLock, Upload, AlertCircle, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DOCUMENT_TYPES, type DatabaseDocument } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DatabaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<DatabaseDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setDocuments(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Derive document type from filename or default to "Other"
      const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
      const matchedType = DOCUMENT_TYPES.find((t) =>
        baseName.includes(t.toLowerCase().split(' ')[0])
      );

      const { error: insertError } = await supabase.from('documents').insert({
        document_name: file.name,
        document_type: matchedType ?? 'Other',
        file_path: filePath,
        file_size: file.size,
      });

      if (insertError) throw insertError;

      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc: DatabaseDocument) => {
    const { data, error } = await supabase.storage.from('documents').download(doc.file_path);
    if (error) {
      setError(error.message);
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.document_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (doc: DatabaseDocument) => {
    if (!confirm(`Delete "${doc.document_name}"? This cannot be undone.`)) return;
    const { error: storageError } = await supabase.storage.from('documents').remove([doc.file_path]);
    if (storageError) {
      setError(storageError.message);
      return;
    }
    const { error: dbError } = await supabase.from('documents').delete().eq('id', doc.id);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const viewUrl = async (doc: DatabaseDocument) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600);
    return data?.signedUrl ?? null;
  };

  const handleView = async (doc: DatabaseDocument) => {
    const url = await viewUrl(doc);
    if (url) {
      setViewing({ ...doc, file_path: url });
    } else {
      setError('Could not generate a view link for this document.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
            <p className="mt-2 text-slate-600">Store and manage all your important government documents securely.</p>
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer self-start">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload Document'}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading documents…</p>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <FileLock className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No documents yet</h3>
            <p className="mt-2 text-sm text-slate-500">Upload your first government document to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileLock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate" title={doc.document_name}>{doc.document_name}</p>
                    <p className="text-xs text-slate-500">{doc.document_type}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1 flex-1">
                  <p>Uploaded: {formatDate(doc.upload_date)}</p>
                  <p>Size: {formatBytes(doc.file_size)}</p>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => handleView(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {viewing && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 truncate">{viewing.document_name}</h3>
              <button onClick={() => setViewing(null)} className="p-1 rounded-md text-slate-500 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {/\.(jpg|jpeg|png)$/i.test(viewing.document_name) ? (
                <img src={viewing.file_path} alt={viewing.document_name} className="w-full h-auto" />
              ) : (
                <iframe src={viewing.file_path} title={viewing.document_name} className="w-full h-[70vh] border-0" />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
