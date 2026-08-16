'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Database, RefreshCw, FolderPlus } from 'lucide-react';
import ResourceFormModal, { ResourceItem } from '../components/ResourceFormModal';

const API_BASE = 'http://localhost:5000/api/resources';

export default function AdminPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      setResources(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch database records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreateNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ResourceItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this resource entry from the MongoDB database?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setResources((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting resource');
    }
  };

  const handleFormSubmit = async (data: Partial<ResourceItem>) => {
    try {
      const isEdit = Boolean(editingItem && (editingItem._id || editingItem.id));
      const targetId = editingItem?._id || editingItem?.id;
      const url = isEdit ? `${API_BASE}/${targetId}` : API_BASE;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} resource`);
      setModalOpen(false);
      fetchResources();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving resource');
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCF9] dark:bg-[#121212] text-stone-900 dark:text-stone-100 font-serif p-6 sm:p-12">
      {/* Header Bar */}
      <header className="border-b border-stone-300 dark:border-stone-800 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-stone-500 flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>EEVOLUTION 2.0 ADMIN CONTROL PANEL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Resource Archive &amp; Telemetry Manager
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchResources}
            title="Refresh Database Records"
            className="p-2 border border-stone-300 dark:border-stone-800 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-mono text-xs font-bold rounded uppercase hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource Topic</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-800 rounded">
          Syncing records with MongoDB server on port 5000...
        </div>
      ) : error ? (
        <div className="p-8 border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded font-mono text-xs space-y-2">
          <p className="font-bold">DATABASE CONNECTIVITY ERROR:</p>
          <p>{error}</p>
          <p className="text-stone-500">Ensure the Node.js Express Backend is running on port 5000.</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-stone-300 dark:border-stone-800 rounded-lg space-y-4 font-mono">
          <FolderPlus className="w-10 h-10 mx-auto text-stone-400" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-black dark:text-white">Nothing to Show</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              There are currently no resource topics stored in the database archive. Click below to add your first technical topic.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black text-xs font-bold rounded uppercase hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Resource Topic</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 font-serif">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-200 dark:border-stone-800 pb-2">
            <span>DATABASE RECORDS: [{resources.length} TOPICS]</span>
            <span>REST API: http://localhost:5000/api/resources</span>
          </div>

          <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-300 dark:border-stone-800 rounded bg-[#FCFCF9] dark:bg-[#161616]">
            {resources.map((item) => {
              const itemId = item._id || item.id;
              return (
                <div key={itemId} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500">
                      <span className="font-bold text-black dark:text-white">[{item.categoryLabel.toUpperCase()}]</span>
                      <span>/</span>
                      <span>{item.topicLabel}</span>
                      <span>|</span>
                      <span>Author: {item.author}</span>
                    </div>

                    <h3 className="text-base font-bold text-black dark:text-white">
                      {item.title}
                    </h3>

                    <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] font-mono text-stone-500 pt-1">
                      ObjectID: <span className="text-blue-900 dark:text-blue-400 font-bold">{itemId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-1 font-mono text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(itemId)}
                      className="p-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-950 flex items-center gap-1 font-mono text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ResourceFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
      />
    </main>
  );
}
