'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, FolderPlus, Shield, UserCheck } from 'lucide-react';
import AdminSidebar, { AdminTab } from '../components/AdminSidebar';
import DedicatedRichEditorialWindow from '../components/DedicatedRichEditorialWindow';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
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
    fetchRecords();
    setViewMode('list');
  }, [activeTab]);

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

  const handleSaveSuccess = () => {
    setViewMode('list');
    fetchRecords();
  };

  const sectionTitles: Record<AdminTab, string> = {
    resources: 'Technical Resources & Specifications',
    projects: 'Engineering Projects & Repositories',
    research: 'Peer-Reviewed Research Papers (No Chapters)',
    software: 'Software Utilities, Installer Links & Patch Notes',
    announcements: 'Admin Bulletins & System Notices',
    users: 'Registered User Accounts & Access Control Roles',
  };

  return (
    <div className="flex min-h-screen bg-[#FCFCF9] dark:bg-[#121212] text-stone-900 dark:text-stone-100 font-serif">
      {/* Sidebar with Navigation Options */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
                <div className="text-xs font-mono text-stone-500 uppercase mb-1">
                  SUPABASE POSTGRESQL ARCHIVE / {activeTab.toUpperCase()}
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
              /* DEDICATED USERS MANAGEMENT TABLE */
              <div className="space-y-4 font-serif">
                <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-200 dark:border-stone-800 pb-2">
                  <span>REGISTERED USERS: [{records.length} USERS]</span>
                  <span>ROLES: SUPERADMIN / EDITOR / NORMAL</span>
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
                            {user.roll_number && <span>Roll: {user.roll_number}</span>}
                            {user.batch_year && <span>Batch: {user.batch_year} (Group {user.batch_group || '1'})</span>}
                            {user.mobile_no && <span>Mobile: {user.mobile_no}</span>}
                          </div>

                          <div className="text-[11px] font-mono text-stone-500">
                            UUID: {user.id}
                          </div>
                        </div>

                        {/* Role Change Selector */}
                        <div className="flex items-center gap-2 self-end md:self-center font-mono text-xs">
                          <Shield className="w-4 h-4 text-stone-500" />
                          <label className="text-stone-500">Assign Role:</label>
                          <select
                            value={user.role || 'normal'}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            className="p-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded font-bold uppercase"
                          >
                            <option value="normal">Normal User</option>
                            <option value="editor">Editor</option>
                            <option value="superadmin">Superadmin</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="guest">Guest</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
              <div className="space-y-4 font-serif">
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

                      {/* Two Action Buttons: Edit and Delete */}
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
