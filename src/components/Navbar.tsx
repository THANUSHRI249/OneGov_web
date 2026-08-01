import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const authLinks = (
    <>
      <Link
        to="/dashboard"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
        }`}
      >
        Dashboard
      </Link>
      <Link
        to="/documents"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/documents') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
        }`}
      >
        Document Vault
      </Link>
      <Link
        to="/applications"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/applications') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
        }`}
      >
        Application Tracker
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </>
  );

  const guestLinks = (
    <>
      <Link
        to="/"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
        }`}
      >
        Home
      </Link>
      <a
        href="/#features"
        className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
      >
        Features
      </a>
      <Link
        to="/login"
        className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Register
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">OneGov</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user ? authLinks : guestLinks}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1 flex flex-col">
            {user ? authLinks : guestLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
