
import React from 'react';
import { BookStructure, ChapterTask } from '../types';
import LoadingIndicator from './LoadingIndicator';

interface OutlineReviewPaneProps {
  title: string | null;
  structure: BookStructure | null;
  chapterTasks: ChapterTask[]; // Keep for potential display consistency if needed
  onProceed: () => void;
  onGoBack: () => void; // This should ideally trigger a reset in App.tsx if full reset is needed
  isLoading: boolean;
}

const renderStructureToList = (struct: BookStructure | string, level = 0, path: string[] = []): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  
  if (typeof struct === 'string') {
    // This case might not be hit if top-level structure is always an object
    // and descriptions are values of keys.
    elements.push(
      <li key={path.join('-') || 'desc'} className={`ml-${level * 4} text-slate-300`}>
        <span className="font-semibold text-slate-100">{path.length > 0 ? path.slice(-1)[0] : "Description"}:</span> {struct}
      </li>
    );
    return elements;
  }
  
  Object.entries(struct).forEach(([key, value]) => {
    const currentPath = [...path, key];
    elements.push(
      <li key={currentPath.join('-')} className={`ml-${level * 4} mt-1 list-none`}>
        <details className="group" open={level < 1}> {/* Open first level by default */}
          <summary className="cursor-pointer py-1 list-none">
            <strong className="text-sky-400 group-hover:text-sky-300 text-base">{key}</strong>
            {typeof value === 'string' && <span className="text-slate-400 ml-2 text-sm italic"> - {value}</span>}
          </summary>
          {typeof value === 'object' && value !== null && (
            <ul className="pl-4 mt-1 border-l border-slate-600">
              {renderStructureToList(value as BookStructure, level + 1, currentPath)}
            </ul>
          )}
        </details>
      </li>
    );
  });
  return elements;
};


const OutlineReviewPane: React.FC<OutlineReviewPaneProps> = ({ title, structure, onProceed, onGoBack, isLoading }) => {
  if (isLoading) { // This isLoading is for the initial outline generation
    return <LoadingIndicator text="Finalizing title and structure..." />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-sky-400 mb-6 text-center">Review Your Book Outline</h2>
      
      {title && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-sky-300 mb-2">Generated Title:</h3>
          <p className="text-2xl text-slate-100 italic font-serif">"{title}"</p>
        </div>
      )}

      {structure && (
        <div className="mb-8 p-4 bg-slate-700 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-sky-300 mb-2">Generated Structure:</h3>
          <ul className="space-y-1 text-sm">
            {renderStructureToList(structure)}
          </ul>
        </div>
      )}
      
      {!title && !structure && !isLoading && <p className="text-center text-slate-400 py-5">No outline generated yet, or an error occurred.</p>}

      <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-3 sm:space-y-0">
        <button
          onClick={onGoBack}
          className="w-full sm:w-auto px-6 py-2 border border-slate-600 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          Back to Inputs & Reset
        </button>
        <button
          onClick={onProceed}
          disabled={!title || !structure}
          className="w-full sm:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          Proceed to Write Chapters
        </button>
      </div>
    </div>
  );
};

export default OutlineReviewPane;