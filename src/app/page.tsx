'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, FolderPlus, Shield, LogOut } from 'lucide-react';
import AdminSidebar, { AdminTab } from '../components/AdminSidebar';
import DedicatedRichEditorialWindow from '../components/DedicatedRichEditorialWindow';
import AdminLoginForm from '../components/AdminLoginForm';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<AdminTab>('resources');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'list' or 'editor'
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const tableNameMap: Record<AdminTab, string> = {
    resources: 'resources',
    projects: 'projects',
    research: 'research_papers',
    software: 'software_tools',
    announcements: 'announcements',
    users: 'profiles',
  };

  // Check auth & role on load
  const verifyAdminAuth = async () => {
    setAuthChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        setAuthChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', session.user.id)
        .single();

      const isAllowedRole = ['superadmin', 'editor', 'admin', 'faculty'].includes(profile?.role);
      const isStudentAdmin = profile?.role === 'student' && profile?.is_admin === true;

      if (profile && (isAllowedRole || isStudentAdmin)) {
        setIsAuthenticated(true);
        setUserRole(profile.role);
        setUserEmail(session.user.email || 'Admin User');
      } else {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    verifyAdminAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    const tableName = tableNameMap[activeTab];

    try {
      const { data, error: sbError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) {
        if (sbError.code === '42P01') {
          setRecords([]);
          return;
        }
        throw sbError;
      }

      setRecords(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch Supabase records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
      setViewMode('list');
    }
  }, [activeTab, isAuthenticated]);

  const handleCreateNew = () => {
    setEditingItem(null);
    setViewMode('editor');
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setViewMode('editor');
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete this record from ${activeTab}?`)) return;

    try {
      const { error: delError } = await supabase
        .from(tableNameMap[activeTab])
        .delete()
        .eq('id', id);

      if (delError) throw delError;

      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting record');
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateErr) throw updateErr;

      setRecords((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating user role');
    }
  };

  const handleUserAdminToggle = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_admin: !currentIsAdmin })
        .eq('id', userId);

      if (updateErr) throw updateErr;

      setRecords((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentIsAdmin } : u))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating user admin status');
    }
  };

  const handleSaveSuccess = () => {
    setViewMode('list');
    fetchRecords();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FCFCF9] dark:bg-[#121212] flex items-center justify-center font-mono text-xs text-stone-500">
        Verifying Admin Credentials &amp; Role Permissions...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={verifyAdminAuth} />;
  }

  const sectionTitles: Record<AdminTab, string> = {
    resources: 'Technical Resources & Specifications',
    projects: 'Engineering Projects & Repositories',
    research: 'Peer-Reviewed Research Papers',
    software: 'Software Utilities, Installer Links & Patch Notes',
    announcements: 'Admin Bulletins & System Notices',
    users: 'User & Role Access Management (Superadmin Only)',
  };

  const isSuperadminDeveloper = userEmail?.toLowerCase().trim() === 'jcsayan7@gmail.com';

  return (
    <div className="flex min-h-screen bg-[#FCFCF9] dark:bg-[#121212] text-stone-900 dark:text-stone-100 font-sans">
      {/* Sidebar with Navigation Options */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {viewMode === 'editor' && activeTab !== 'users' ? (
          <DedicatedRichEditorialWindow
            activeTab={activeTab}
            initialData={editingItem}
            onBack={() => setViewMode('list')}
            onSaveSuccess={handleSaveSuccess}
          />
        ) : (
          <>
            <header className="border-b border-stone-300 dark:border-stone-800 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-stone-500 uppercase mb-1 flex items-center gap-2">
                  <span>SUPABASE POSTGRESQL ARCHIVE / {activeTab.toUpperCase()}</span>
                  <span>•</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">ROLE: {userRole?.toUpperCase()}</span>
                  <span>({userEmail})</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  {sectionTitles[activeTab]}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRecords}
                  title="Refresh Database Records"
                  className="p-2 border border-stone-300 dark:border-stone-800 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {activeTab !== 'users' && (
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-mono text-xs font-bold rounded uppercase hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open {activeTab.slice(0, -1).toUpperCase()} Editorial Window</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out of Admin Portal"
                  className="flex items-center gap-1.5 px-3 py-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 font-mono text-xs rounded hover:bg-red-50 dark:hover:bg-red-950 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </header>

            {loading ? (
              <div className="p-12 text-center font-mono text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-800 rounded">
                Syncing records from Supabase PostgreSQL database...
              </div>
            ) : error ? (
              <div className="p-8 border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded font-mono text-xs space-y-2">
                <p className="font-bold">SUPABASE QUERY NOTICE:</p>
                <p>{error}</p>
              </div>
            ) : activeTab === 'users' ? (
              /* DEDICATED USERS MANAGEMENT TABLE (EXCLUSIVELY FOR SUPERADMIN DEVELOPER jcsayan7@gmail.com) */
              !isSuperadminDeveloper ? (
                <div className="p-12 text-center border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/60 rounded text-red-700 dark:text-red-300 font-mono text-xs space-y-2">
                  <p className="font-bold uppercase">[ ACCESS RESTRICTED ]</p>
                  <p>User &amp; Role Access Management is strictly restricted to Superadmin Developer (jcsayan7@gmail.com).</p>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-200 dark:border-stone-800 pb-2">
                    <span>REGISTERED USERS: [{records.length} USERS]</span>
                    <span>ROLES: SUPERADMIN / FACULTY / STUDENT ADMIN / EDITOR</span>
                  </div>

                  <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-300 dark:border-stone-800 rounded bg-[#FCFCF9] dark:bg-[#161616]">
                    {records.length === 0 ? (
                      <div className="p-12 text-center text-xs font-mono text-stone-500">
                        No user profiles registered yet. Users will appear here after signing in.
                      </div>
                    ) : (
                      records.map((user) => (
                        <div
                          key={user.id}
                          className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="font-bold text-black dark:text-white">
                                {user.full_name || 'Anonymous User'}
                              </span>
                              <span className="text-stone-400">({user.email || 'No Email'})</span>
                            </div>

                            <div className="text-xs text-stone-600 dark:text-stone-400 font-mono flex flex-wrap gap-3">
                              <span>Role: <strong className="uppercase text-blue-900 dark:text-blue-400">{user.role || 'normal'}</strong></span>
                              {user.is_admin && <span className="font-bold text-emerald-600 dark:text-emerald-400">[ADMIN ACCESS ENABLED]</span>}
                              {user.roll_number && <span>Roll: {user.roll_number}</span>}
                              {user.batch_year && <span>Batch: {user.batch_year} (Group {user.batch_group || '1'})</span>}
                              {user.mobile_no && <span>Mobile: {user.mobile_no}</span>}
                            </div>

                            <div className="text-[11px] font-mono text-stone-500">
                              UUID: {user.id}
                            </div>
                          </div>

                          {/* Role & Admin Toggle Selectors (Superadmin Developer Only) */}
                          <div className="flex flex-wrap items-center gap-3 self-end md:self-center font-mono text-xs">
                            <button
                              onClick={() => handleUserAdminToggle(user.id, user.is_admin || false)}
                              className={`px-2.5 py-1 border rounded font-bold uppercase ${
                                user.is_admin
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'border-stone-300 text-stone-600 dark:border-stone-700 dark:text-stone-400'
                              }`}
                            >
                              {user.is_admin ? 'Admin: ON' : 'Admin: OFF'}
                            </button>

                            <div className="flex items-center gap-1.5">
                              <Shield className="w-4 h-4 text-stone-500" />
                              <select
                                value={user.role || 'normal'}
                                onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                className="p-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded font-bold uppercase"
                              >
                                <option value="normal">Normal User</option>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="editor">Editor</option>
                                <option value="superadmin">Superadmin</option>
                                <option value="guest">Guest</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            ) : records.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 rounded-lg space-y-4 font-mono">
                <FolderPlus className="w-10 h-10 mx-auto text-stone-400" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-black dark:text-white">Nothing to Show</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    No entries stored under {sectionTitles[activeTab]} yet. Click below to open the custom editorial window and publish to the website.
                  </p>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black text-xs font-bold rounded uppercase hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open {activeTab.toUpperCase()} Editorial Window</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-200 dark:border-stone-800 pb-2">
                  <span>CURRENT AVAILABLE DATA: [{records.length} ENTRIES]</span>
                  <span>ACTIONS: EDIT &amp; DELETE</span>
                </div>

                <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-300 dark:border-stone-800 rounded bg-[#FCFCF9] dark:bg-[#161616]">
                  {records.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors">
                      <div className="space-y-1 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500">
                          <span className="font-bold text-black dark:text-white uppercase">
                            [{item.project_type || item.tag || item.journal || item.version || item.category_label || item.category || 'ENTRY'}]
                          </span>
                          {item.topic_label && <span>/ {item.topic_label}</span>}
                          {item.author && <span>| Author: {item.author}</span>}
                        </div>

                        <h3 className="text-base font-bold text-black dark:text-white">
                          {item.title || item.name}
                        </h3>

                        <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                          {item.description || item.summary || item.abstract}
                        </p>

                        <div className="text-[11px] font-mono text-stone-500 pt-1">
                          UUID: <span className="text-blue-900 dark:text-blue-400 font-bold">{item.id}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-1 font-mono text-xs font-bold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-950 flex items-center gap-1 font-mono text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
