import { Link } from 'react-router-dom';
import { FileLock, ClipboardList, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'User';

  const cards = [
    {
      icon: FileLock,
      title: 'Document Vault',
      description: 'Store and manage all your important government documents securely.',
      to: '/documents',
    },
    {
      icon: ClipboardList,
      title: 'Application Tracker',
      description: 'Track all your government applications from one place.',
      to: '/applications',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Welcome {firstName}</h1>
          <p className="mt-2 text-slate-600">Manage your documents and track applications from one dashboard.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 flex flex-col"
            >
              <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                <card.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-slate-600 flex-1">{card.description}</p>
              <Link
                to={card.to}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors self-start"
              >
                Open
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
