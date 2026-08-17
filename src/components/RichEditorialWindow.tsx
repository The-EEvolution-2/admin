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
} from 'lucide-react';
import { RESOURCE_CATEGORIES } from '@/constants/nestedResourcesData';
import { supabase } from '../lib/supabaseClient';

interface EditorProps {
  onBack: () => void;
  onSaveSuccess: () => void;
  initialData?: any;
}

export default function RichEditorialWindow({ onBack, onSaveSuccess, initialData }: EditorProps) {
  // Step 1 Selection State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category_slug || 'general');
  const [chapterName, setChapterName] = useState<string>(initialData?.topic_label || '');
  const [blogTitle, setBlogTitle] = useState<string>(initialData?.title || '');
  const [difficulty, setDifficulty] = useState<string>(initialData?.difficulty || 'Introductory');
  const [author, setAuthor] = useState<string>(initialData?.author || 'EE General Curriculum Board');
  const [abstract, setAbstract] = useState<string>(initialData?.description || '');

  // Step 2 Editorial Body State
  const [contentBody, setContentBody] = useState<string>(
    initialData?.content_body || 'Write detailed technical specifications, LaTeX formulas, or descriptions here...'
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Helper toolbar actions for inserting structured blocks
  const insertTextAtCursor = (insertion: string) => {
    setContentBody((prev) => prev + '\n\n' + insertion);
  };

  const handleInsertParagraph = () => {
    insertTextAtCursor('Insert detailed technical paragraph text here...');
  };

  const handleInsertTable = () => {
    insertTextAtCursor(`| Parameter | Condition | Value |\n| :--- | :--- | :--- |\n| Voltage (Vth) | Open Circuit | 8.25 V |\n| Resistance (Rth) | Terminals A-B | 218.75 Ω |`);
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:', 'https://example.com/schematic.png');
    if (url) {
      insertTextAtCursor(`![Technical Schematic Diagram](${url})`);
    }
  };

  const handleInsertChart = () => {
    insertTextAtCursor(`[CHART: Frequency (kHz) vs Gain (dB)]\n10kHz: 0dB, 50kHz: -3dB, 100kHz: -6dB`);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter Link URL:', 'https://ieeexplore.ieee.org');
    const text = prompt('Enter Link Text:', 'IEEE Reference Document');
    if (url && text) {
      insertTextAtCursor(`[${text}](${url})`);
    }
  };

  const handleSaveToWebsite = async () => {
    if (!blogTitle.trim() || !chapterName.trim()) {
      alert('Please fill in both the Chapter Name and Blog Title before saving.');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      const categoryMeta = RESOURCE_CATEGORIES.find((c) => c.slug === selectedCategory);
      const categoryLabel = categoryMeta ? categoryMeta.name : selectedCategory;

      const payload = {
        title: blogTitle,
        description: abstract || 'Detailed technical specification blog post.',
        category: categoryLabel,
        category_slug: selectedCategory,
        category_label: categoryLabel,
        topic_slug: chapterName.toLowerCase().replace(/\s+/g, '-'),
        topic_label: chapterName,
        author,
        file_size: '4.8 MB PDF',
        difficulty,
        content_body: contentBody,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('resources')
          .update(payload)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resources')
          .insert([payload]);

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
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Published to Website!</span>
            </span>
          )}
          <button
            onClick={handleSaveToWebsite}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-mono text-xs font-bold rounded uppercase hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish to Website'}</span>
          </button>
        </div>
      </div>

      {/* Step 1: Category, Chapter & Title Selection */}
      <section className="space-y-4 bg-[#F8F8F5] dark:bg-[#161616] p-4 border border-stone-300 dark:border-stone-800 rounded font-mono text-xs">
        <h3 className="font-bold text-sm text-black dark:text-white uppercase">
          STEP 1: TOPIC CATEGORY, CHAPTER &amp; TITLE SETUP
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
              placeholder="e.g. Subatomic Foundations & Charge"
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
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1">Author Name:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
            />
          </div>
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1">Difficulty Level:</label>
            <input
              type="text"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
            />
          </div>
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1">Abstract Summary:</label>
            <input
              type="text"
              placeholder="Brief summary for indexing"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
            />
          </div>
        </div>
      </section>

      {/* Step 2: Editorial Window Toolbar */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 dark:border-stone-800 pb-2">
          <h3 className="font-bold text-sm text-black dark:text-white uppercase font-mono">
            STEP 2: RICH EDITORIAL CANVAS TOOLBAR
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={handleInsertParagraph}
              title="Insert Paragraph Block"
              className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Paragraph</span>
            </button>

            <button
              onClick={handleInsertTable}
              title="Insert Structured Table"
              className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>+ Table</span>
            </button>

            <button
              onClick={handleInsertImage}
              title="Insert Technical Diagram / Image"
              className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>+ Image</span>
            </button>

            <button
              onClick={handleInsertChart}
              title="Insert Technical Chart Block"
              className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>+ Chart</span>
            </button>

            <button
              onClick={handleInsertLink}
              title="Insert Hyperlink"
              className="flex items-center gap-1 px-2.5 py-1 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>+ Link</span>
            </button>
          </div>
        </div>

        {/* Editorial Window Canvas Area */}
        <textarea
          rows={16}
          value={contentBody}
          onChange={(e) => setContentBody(e.target.value)}
          className="w-full p-4 border border-stone-300 dark:border-stone-800 bg-[#FCFCF9] dark:bg-[#141414] text-black dark:text-white font-serif text-sm leading-relaxed rounded shadow-inner focus:outline-none focus:ring-1 focus:ring-stone-500"
          placeholder="Write technical documentation, formulas, and insert tables or images using the toolbar above..."
        />
      </section>
    </div>
  );
}
