import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">OneGov</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              One place for government services. Store documents securely and track applications from a single dashboard.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@onegov.in</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1800-200-0000</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-slate-400 text-center">
          <p>&copy; {new Date().getFullYear()} OneGov. All rights reserved.</p>
          <p className="mt-1 text-xs text-slate-500">OneGov is a dashboard for document management and application tracking. It does not replace official government portals.</p>
        </div>
      </div>
    </footer>
  );
}
