'use client';

import React, { useState } from 'react';
import {
  FileText,
  FolderGit2,
  BookOpen,
  Cpu,
  Bell,
  Database,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

export type AdminTab = 'resources' | 'projects' | 'research' | 'software' | 'announcements';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resources', label: 'Resources Archive', icon: <FileText className="w-4 h-4" /> },
    { id: 'projects', label: 'Engineering Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'research', label: 'Peer Research Papers', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'software', label: 'Software Utilities', icon: <Cpu className="w-4 h-4" /> },
    { id: 'announcements', label: 'Admin Bulletins', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 border-r border-stone-300 dark:border-stone-800 bg-[#F7F7F4] dark:bg-[#161616] p-4 flex flex-col justify-between font-serif z-30 overflow-y-auto">
      <div className="space-y-6">
        {/* Brand */}
        <div className="border-b border-stone-300 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2 font-bold text-lg text-black dark:text-white">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>EEvolution 2.0</span>
          </div>
          <p className="text-[11px] font-mono text-stone-500 mt-1 uppercase">
            Admin Control Center
          </p>
        </div>

        {/* Sidebar Navigation Options */}
        <nav className="space-y-1 font-mono text-xs">
          <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 px-2">
            DATABASE SECTIONS
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-black font-bold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-stone-300 dark:border-stone-800 font-mono text-[11px] text-stone-500 space-y-1">
        <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Supabase RLS Active</span>
        </div>
        <p>© 2026 Admin Portal</p>
      </div>
    </aside>
  );
}
