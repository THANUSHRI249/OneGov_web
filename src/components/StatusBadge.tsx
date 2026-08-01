import type { ApplicationStatus } from '@/types';

const styles: Record<ApplicationStatus, string> = {
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Verification': 'bg-amber-50 text-amber-700 border-amber-200',
  'Additional Document Required': 'bg-orange-50 text-orange-700 border-orange-200',
  'Approved': 'bg-green-50 text-green-700 border-green-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cls = styles[status] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}
