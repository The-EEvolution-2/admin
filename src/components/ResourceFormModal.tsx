import React from 'react';

export interface ResourceItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  categoryLabel: string;
  topicSlug: string;
  topicLabel: string;
  author: string;
  date: string;
  url: string;
  fileSize?: string;
  difficulty?: string;
  contentBody?: string;
}

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ResourceItem>) => void;
  initialData?: ResourceItem | null;
}

export default function ResourceFormModal({ isOpen, onClose, onSubmit, initialData }: ResourceFormModalProps) {
  const [formData, setFormData] = React.useState<Partial<ResourceItem>>({
    title: '',
    description: '',
    category: 'General',
    categorySlug: 'general',
    categoryLabel: 'General',
    topicSlug: 'subatomic-foundations',
    topicLabel: 'Subatomic Foundations',
    author: 'EE General Curriculum Board',
    difficulty: 'Introductory',
    fileSize: '4.8 MB PDF',
    contentBody: '',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'General',
        categorySlug: 'general',
        categoryLabel: 'General',
        topicSlug: 'subatomic-foundations',
        topicLabel: 'Subatomic Foundations',
        author: 'EE General Curriculum Board',
        difficulty: 'Introductory',
        fileSize: '4.8 MB PDF',
        contentBody: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#FCFCF9] dark:bg-[#161616] border border-stone-300 dark:border-stone-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 font-serif shadow-2xl">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4 border-b border-stone-300 dark:border-stone-800 pb-2">
          {initialData ? 'EDIT RESOURCE TOPIC' : 'CREATE NEW RESOURCE TOPIC'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-stone-700 dark:text-stone-300 mb-1">Title:</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">Category:</label>
              <select
                value={formData.categorySlug || 'general'}
                onChange={(e) => {
                  const slug = e.target.value;
                  const labelMap: Record<string, string> = {
                    academics: 'Academics',
                    general: 'General',
                    experimental: 'Experimental',
                    books: 'Books',
                    'practice-sets': 'Practice Sets',
                    history: 'History of Electrical Engineering',
                    career: 'Career & Industry Paths',
                  };
                  setFormData({
                    ...formData,
                    categorySlug: slug,
                    categoryLabel: labelMap[slug] || slug,
                    category: labelMap[slug] || slug,
                  });
                }}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
              >
                <option value="academics">Academics</option>
                <option value="general">General</option>
                <option value="experimental">Experimental</option>
                <option value="books">Books</option>
                <option value="practice-sets">Practice Sets</option>
                <option value="history">History of Electrical Engineering</option>
                <option value="career">Career &amp; Industry Paths</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">Topic Label:</label>
              <input
                type="text"
                required
                value={formData.topicLabel || ''}
                onChange={(e) => setFormData({ ...formData, topicLabel: e.target.value, topicSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 dark:text-stone-300 mb-1">Description / Abstract:</label>
            <textarea
              rows={3}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">Author:</label>
              <input
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
              />
            </div>
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">Level:</label>
              <input
                type="text"
                value={formData.difficulty || ''}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
              />
            </div>
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">File Size:</label>
              <input
                type="text"
                value={formData.fileSize || ''}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-black dark:text-white rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-300 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-400 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 rounded text-black dark:text-white font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-black hover:opacity-90 rounded font-bold uppercase"
            >
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
