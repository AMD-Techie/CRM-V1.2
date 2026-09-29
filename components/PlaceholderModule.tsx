
import React from 'react';
import { IconSparkles } from './Icons';

interface PlaceholderModuleProps {
  title: string;
}

const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="p-4 bg-purple-100 dark:bg-slate-800 rounded-full">
        <IconSparkles className="w-12 h-12 text-purple-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        This module is currently under development. Stay tuned for AI-powered updates!
      </p>
      <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
        Notify Me
      </button>
    </div>
  );
};

export default PlaceholderModule;
