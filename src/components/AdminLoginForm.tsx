'use client';

import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminLoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error('Authentication failed');

      // 2. Check user role & attributes in public.profiles table
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        await supabase.auth.signOut();
        throw new Error('No profile record found. Access denied.');
      }

      // Allowed: Superadmin, Editor, Admin, Faculty, or Student with is_admin = true
      const isAllowedRole = ['superadmin', 'editor', 'admin', 'faculty'].includes(profile.role);
      const isStudentAdmin = profile.role === 'student' && profile.is_admin === true;

      if (!isAllowedRole && !isStudentAdmin) {
        await supabase.auth.signOut();
        throw new Error(
          `Access Denied: Your account role (${profile.role}) does not have Admin Portal access. Only Faculty, Superadmins, Editors, or Students with Admin rights can access.`
        );
      }

      onLoginSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-[#121212] flex items-center justify-center p-4 font-sans text-xs">
      <div className="max-w-md w-full border border-stone-300 dark:border-stone-800 bg-[#FCFCF9] dark:bg-[#161616] p-8 rounded-lg shadow-2xl space-y-6">
        <div className="text-center border-b border-stone-300 dark:border-stone-800 pb-4">
          <h1 className="text-2xl font-bold text-black dark:text-white uppercase tracking-wide">
            EEVOLUTION 2.0 ADMIN PORTAL
          </h1>
          <p className="text-xs font-mono text-stone-500 mt-1 uppercase">
            RESTRICTED ACCESS • FACULTY &amp; ADMINS ONLY
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs rounded flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-bold">Admin / Faculty Email:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="email"
                required
                placeholder="faculty@eevolution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 p-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-bold">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 p-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-bold uppercase tracking-wider rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Verifying Admin Privileges...' : 'Authorize & Enter Admin Panel'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-500 text-center space-y-0.5">
          <p>Restricted access for Faculty and Admin Students.</p>
          <p className="text-stone-400">Contact system superadmin for authorization.</p>
        </div>
      </div>
    </div>
  );
}
