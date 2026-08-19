import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-[#121212] flex items-center justify-center font-sans p-6 text-stone-900 dark:text-stone-100">
      <div className="max-w-md w-full p-6 border border-stone-300 dark:border-stone-800 rounded-xl space-y-3 text-center">
        <h2 className="text-xl font-bold">404 - Page Not Found</h2>
        <p className="text-xs text-stone-500 font-mono">The requested admin route does not exist.</p>
      </div>
    </div>
  );
}
