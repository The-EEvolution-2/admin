'use client';

import React, { useState } from 'react';
import {
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart2,
  Save,
  ArrowLeft,
  CheckCircle,
  Eye,
  Edit3,
} from 'lucide-react';
import { RESOURCE_CATEGORIES } from '@/constants/nestedResourcesData';
import { supabase } from '../lib/supabaseClient';
import { AdminTab } from './AdminSidebar';

interface RichEditorialProps {
  activeTab: AdminTab;
  onBack: () => void;
  onSaveSuccess: () => void;
  initialData?: any;
}

export default function DedicatedRichEditorialWindow({
  activeTab,
  onBack,
  onSaveSuccess,
  initialData,
}: RichEditorialProps) {
  // Mode state: 'edit' or 'preview'
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // --- COMMON FIELDS ---
  const [title, setTitle] = useState<string>(initialData?.title || initialData?.name || '');
  const [author, setAuthor] = useState<string>(initialData?.author || 'EE General Curriculum Board');
  const [description, setDescription] = useState<string>(
    initialData?.description || initialData?.abstract || initialData?.summary || ''
  );
  const [contentBody, setContentBody] = useState<string>(
    initialData?.content_body || initialData?.details || 'Write detailed documentation here...'
  );

  // --- 1. RESOURCES SPECIFIC FIELDS ---
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category_slug || 'general');
  const [chapterName, setChapterName] = useState<string>(initialData?.topic_label || '');
  const [difficulty, setDifficulty] = useState<string>(initialData?.difficulty || 'Introductory');

  // --- 2. PROJECTS SPECIFIC FIELDS ---
  const [projectCategory, setProjectCategory] = useState<'hardware' | 'software' | 'embedded'>(
    initialData?.project_type || 'hardware'
  );
  const [projectTags, setProjectTags] = useState<string>(
    Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : initialData?.tags || 'PCB, Microcontroller'
  );
  const [repoUrl, setRepoUrl] = useState<string>(initialData?.repo_url || 'https://github.com/The-EEvolution-2');

  // --- 3. RESEARCH SPECIFIC FIELDS ---
  const [journalName, setJournalName] = useState<string>(initialData?.journal || 'IEEE Transactions on Power Electronics');
  const [doi, setDoi] = useState<string>(initialData?.doi || '10.1109/TPEL.2026.1049201');

  // --- 4. SOFTWARE SPECIFIC FIELDS ---
  const [softwareVersion, setSoftwareVersion] = useState<string>(initialData?.version || 'v2.4.0-stable');
  const [downloadUrl, setDownloadUrl] = useState<string>(initialData?.download_url || 'https://example.com/installer.exe');
  const [installationGuide, setInstallationGuide] = useState<string>(
    initialData?.installation_guide || '1. Download installer.exe\n2. Run setup as Administrator\n3. Configure PATH'
  );
  const [patchNotes, setPatchNotes] = useState<string>(
    initialData?.patch_notes || '- Added GaN FET simulation solver\n- Reduced memory consumption by 35%'
  );

  // --- 5. ANNOUNCEMENTS SPECIFIC FIELDS ---
  const [bulletinTag, setBulletinTag] = useState<string>(initialData?.tag || 'SYSTEM NOTICE');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>(initialData?.priority || 'normal');

  // Helper toolbar actions for inserting structured blocks into content body
  const insertTextAtCursor = (insertion: string) => {
    setContentBody((prev) => prev + '\n\n' + insertion);
  };

  const handleSaveToWebsite = async () => {
    if (!title.trim()) {
      alert('Title is required to publish.');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      let payload: any = {};
      let targetTable = 'resources';

      if (activeTab === 'resources') {
        targetTable = 'resources';
        const catObj = RESOURCE_CATEGORIES.find((c) => c.slug === selectedCategory);
        const categoryLabel = catObj ? catObj.name : selectedCategory;
        payload = {
          title,
          description,
          category: categoryLabel,
          category_slug: selectedCategory,
          category_label: categoryLabel,
          topic_slug: chapterName.toLowerCase().replace(/\s+/g, '-'),
          topic_label: chapterName,
          author,
          difficulty,
          content_body: contentBody,
        };
      } else if (activeTab === 'projects') {
        targetTable = 'projects';
        payload = {
          title,
          description,
          project_type: projectCategory,
          tags: projectTags.split(',').map((t) => t.trim()),
          repo_url: repoUrl,
          author,
          content_body: contentBody,
        };
      } else if (activeTab === 'research') {
        targetTable = 'research_papers';
        payload = {
          title,
          abstract: description,
          author,
          journal: journalName,
          doi,
          content_body: contentBody,
        };
      } else if (activeTab === 'software') {
        targetTable = 'software_tools';
        payload = {
          title,
          description,
          version: softwareVersion,
          download_url: downloadUrl,
          installation_guide: installationGuide,
          patch_notes: patchNotes,
          author,
          content_body: contentBody,
        };
      } else if (activeTab === 'announcements') {
        targetTable = 'announcements';
        payload = {
          title,
          summary: description,
          tag: bulletinTag,
          priority,
          author,
          date: new Date().toISOString().split('T')[0],
        };
      }

      if (initialData?.id) {
        const { error } = await supabase
          .from(targetTable)
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(targetTable).insert([payload]);
        if (error) throw error;
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onSaveSuccess();
      }, 1200);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving to website');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FCFCF9] dark:bg-[#121212] border border-stone-300 dark:border-stone-800 rounded-lg p-6 font-serif space-y-6">
      {/* Header Actions & Mode Toggle */}
      <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 rounded font-mono text-xs">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                mode === 'edit'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-black font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                mode === 'preview'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-black font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Website Preview</span>
            </button>
          </div>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Published to Website!</span>
            </span>
          )}

          <button
            onClick={handleSaveToWebsite}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-mono text-xs font-bold rounded uppercase hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : `Save & Publish ${activeTab.toUpperCase()}`}</span>
          </button>
        </div>
      </div>

      {/* EDIT MODE */}
      {mode === 'edit' ? (
        <div className="space-y-6">
          {/* 1. RESOURCE DEDICATED FIELDS */}
          {activeTab === 'resources' && (
            <section className="space-y-4 bg-[#F8F8F5] dark:bg-[#161616] p-4 border border-stone-300 dark:border-stone-800 rounded font-mono text-xs">
              <h3 className="font-bold text-sm text-black dark:text-white uppercase">
                RESOURCES METADATA (CATEGORY &amp; CHAPTER)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Select Topic Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  >
                    {RESOURCE_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Chapter Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Subatomic Foundations"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Blog Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Atomic Structure & Free Electron Movement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
              </div>
            </section>
          )}

          {/* 2. PROJECT DEDICATED FIELDS */}
          {activeTab === 'projects' && (
            <section className="space-y-4 bg-[#F8F8F5] dark:bg-[#161616] p-4 border border-stone-300 dark:border-stone-800 rounded font-mono text-xs">
              <h3 className="font-bold text-sm text-black dark:text-white uppercase">
                ENGINEERING PROJECT METADATA (HARDWARE / SOFTWARE / EMBEDDED)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Project Classification:</label>
                  <select
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded font-bold"
                  >
                    <option value="hardware">Hardware Project</option>
                    <option value="software">Software Utility</option>
                    <option value="embedded">Embedded Firmware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Project Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. GaN Inverter PCB Schematic"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Tags (Comma-Separated):</label>
                  <input
                    type="text"
                    placeholder="e.g. PCB, Microcontroller, Verilog"
                    value={projectTags}
                    onChange={(e) => setProjectTags(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Repository URL:</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                />
              </div>
            </section>
          )}

          {/* 3. RESEARCH PAPER DEDICATED FIELDS (No Chapters) */}
          {activeTab === 'research' && (
            <section className="space-y-4 bg-[#F8F8F5] dark:bg-[#161616] p-4 border border-stone-300 dark:border-stone-800 rounded font-mono text-xs">
              <h3 className="font-bold text-sm text-black dark:text-white uppercase">
                RESEARCH PAPER METADATA (IEEE / PEER REVIEW)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Paper Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. High-Frequency Switching Losses in SiC MOSFETs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Target Journal / Conference:</label>
                  <input
                    type="text"
                    value={journalName}
                    onChange={(e) => setJournalName(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Digital Object Identifier (DOI):</label>
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
              </div>
            </section>
          )}

          {/* 4. SOFTWARE DEDICATED FIELDS */}
          {activeTab === 'software' && (
            <section className="space-y-4 bg-[#F8F8F5] dark:bg-[#161616] p-4 border border-stone-300 dark:border-stone-800 rounded font-mono text-xs">
              <h3 className="font-bold text-sm text-black dark:text-white uppercase">
                SOFTWARE METADATA (INSTALLATION GUIDE &amp; PATCH NOTES)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Software Tool Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Waveform DSP Analyzer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Version Tag:</label>
                  <input
                    type="text"
                    value={softwareVersion}
                    onChange={(e) => setSoftwareVersion(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Installer / Download File Link:</label>
                  <input
                    type="text"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Installation Guide Steps:</label>
                  <textarea
                    rows={3}
                    value={installationGuide}
                    onChange={(e) => setInstallationGuide(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Patch Notes &amp; Release Log:</label>
                  <textarea
                    rows={3}
                    value={patchNotes}
                    onChange={(e) => setPatchNotes(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
              </div>
            </section>
          )}

          {/* 5. ANNOUNCEMENT DEDICATED FIELDS */}
          {activeTab === 'announcements' && (
            <section className="space-y-4 bg-[#F8F8F5] dark:bg-[#161616] p-4 border border-stone-300 dark:border-stone-800 rounded font-mono text-xs">
              <h3 className="font-bold text-sm text-black dark:text-white uppercase">
                ADMIN BULLETIN NOTICE METADATA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Notice Headline:</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Equipment Calibration Notice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Tag Identifier:</label>
                  <input
                    type="text"
                    value={bulletinTag}
                    onChange={(e) => setBulletinTag(e.target.value)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Priority Level:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded font-bold"
                  >
                    <option value="normal">Normal Bulletin</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent System Alert</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* COMMON ABSTRACT / SUMMARY */}
          {activeTab !== 'announcements' && (
            <div className="font-mono text-xs">
              <label className="block text-stone-600 dark:text-stone-400 mb-1">Abstract Summary / Short Description:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
              />
            </div>
          )}

          {/* RICH TOOLBAR & CONTENT BODY (FOR ALL EXCEPT ANNOUNCEMENTS IF NOT APPLICABLE) */}
          {activeTab !== 'announcements' && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 dark:border-stone-800 pb-2">
                <h3 className="font-bold text-sm text-black dark:text-white uppercase font-mono">
                  RICH EDITORIAL CANVAS TOOLBAR
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => insertTextAtCursor('Insert paragraph text here...')}
                    className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ Paragraph</span>
                  </button>
                  <button
                    onClick={() => insertTextAtCursor(`| Parameter | Condition | Value |\n| :--- | :--- | :--- |\n| Voltage | 12V | Nom |`)}
                    className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>+ Table</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = prompt('Image URL:');
                      if (url) insertTextAtCursor(`![Image](${url})`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>+ Image</span>
                  </button>
                  <button
                    onClick={() => insertTextAtCursor(`[CHART: Frequency vs Gain]`)}
                    className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>+ Chart</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = prompt('Link URL:');
                      const text = prompt('Link Text:');
                      if (url && text) insertTextAtCursor(`[${text}](${url})`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>+ Link</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={14}
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                className="w-full p-4 border border-stone-300 dark:border-stone-800 bg-[#FCFCF9] dark:bg-[#141414] text-black dark:text-white font-serif text-sm leading-relaxed rounded shadow-inner focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </section>
          )}
        </div>
      ) : (
        /* PREVIEW MODE */
        <div className="space-y-6 border border-stone-300 dark:border-stone-800 bg-[#FCFCF9] dark:bg-[#121212] p-6 rounded font-serif">
          <div className="text-xs font-mono text-stone-500 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <span>LIVE WEBSITE PREVIEW: [{activeTab.toUpperCase()}]</span>
            <span className="text-blue-900 dark:text-blue-400 font-bold">EXACT FRONTEND SIMULATION</span>
          </div>

          <article className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 border border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-800 font-bold uppercase text-black dark:text-white">
                {activeTab === 'projects' ? projectCategory : activeTab === 'announcements' ? bulletinTag : selectedCategory}
              </span>
              <span>•</span>
              <span className="text-stone-500">Author: {author}</span>
            </div>

            <h1 className="text-2xl font-bold text-black dark:text-white">{title || 'Publication Title'}</h1>

            <p className="text-xs font-serif text-stone-700 dark:text-stone-300 italic border-l-2 border-stone-400 pl-3">
              {description || 'Summary description of publication.'}
            </p>

            {activeTab === 'software' && (
              <div className="p-3 bg-[#F5F5F0] dark:bg-[#181818] border border-stone-300 dark:border-stone-800 font-mono text-xs space-y-2">
                <p className="font-bold text-black dark:text-white">INSTALLATION GUIDE ({softwareVersion}):</p>
                <pre className="text-stone-800 dark:text-stone-300 whitespace-pre-wrap">{installationGuide}</pre>
                <p className="font-bold text-black dark:text-white pt-2">PATCH NOTES:</p>
                <pre className="text-stone-800 dark:text-stone-300 whitespace-pre-wrap">{patchNotes}</pre>
              </div>
            )}

            {activeTab !== 'announcements' && (
              <div className="space-y-4 text-sm whitespace-pre-wrap leading-relaxed">{contentBody}</div>
            )}
          </article>
        </div>
      )}
    </div>
  );
}
