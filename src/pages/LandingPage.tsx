import { Link } from 'react-router-dom';
import { FileLock, ClipboardList, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  {
    icon: FileLock,
    title: 'Document Vault',
    description: 'Upload and manage all your important government documents in one secure location.',
  },
  {
    icon: ClipboardList,
    title: 'Application Tracker',
    description: 'Track the status of every government application you submit from a single dashboard.',
  },
  {
    icon: Lock,
    title: 'Secure Storage',
    description: 'Your documents are stored securely and accessible only by you, with full privacy control.',
  },
];

const trustPoints = [
  'Aadhaar, PAN, Passport, GST, FSSAI & more',
  'Real-time application status updates',
  'Bank-grade secure document storage',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm text-center py-2 px-4">
        This is a demo of an idea, not an official government service.
      </div>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-slate-50 to-slate-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-6">
                  Unified Government Services Dashboard
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  One Place for Government Services
                </h1>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                  Store your important documents securely and track all your government applications from one dashboard.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-slate-700 font-semibold border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Login
                  </Link>
                </div>
                <ul className="mt-10 space-y-3">
                  {trustPoints.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-blue-200/30 rounded-3xl blur-2xl" />
                  <img
                    src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=900"
                    alt="Government services dashboard"
                    className="relative rounded-2xl shadow-xl w-full object-cover h-[420px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything in one place</h2>
            <p className="mt-4 text-slate-600">
              OneGov brings your government documents and applications together so you never lose track of what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold text-white">Start managing your government documents today</h2>
            <p className="mt-4 text-slate-300">Create a free account and organize your documents and applications in minutes.</p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
