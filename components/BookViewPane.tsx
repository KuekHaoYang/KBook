import React, { useState } from 'react';
import { ChapterTask } from '../types';

interface BookViewPaneProps {
  title: string | null;
  chapters: ChapterTask[];
  onStartOver: () => void;
}

const BookViewPane: React.FC<BookViewPaneProps> = ({ title, chapters, onStartOver }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const generateMarkdownContent = (): string => {
    let markdown = "";
    if (title) {
      markdown += `# ${title}\n\n`;
    }
    chapters.forEach(chapter => {
      if (chapter.status === 'done' && chapter.content) {
        // The chapter.content from AI is now expected to include the "## Chapter Title" Markdown
        markdown += `${chapter.content}\n\n`; 
      }
    });
    return markdown.trim();
  };

  const handleCopyToClipboard = async () => {
    const markdown = generateMarkdownContent();
    if (!markdown) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('copied');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('error');
    }
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDownloadTxt = () => {
    const markdown = generateMarkdownContent();
    if (!markdown) return;

    const blob = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'book';
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const successfullyGeneratedChapters = chapters.filter(ch => ch.status === 'done' && ch.content);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800/50 rounded-xl shadow-2xl backdrop-blur-md">
      <h2 className="text-4xl font-extrabold text-sky-300 mb-4 text-center tracking-tight">
        {title || "Your Generated Book"}
      </h2>
      
      <div className="my-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={handleCopyToClipboard}
          disabled={copyStatus !== 'idle' || successfullyGeneratedChapters.length === 0}
          className="px-6 py-2 border border-sky-500 text-sky-300 font-medium rounded-md hover:bg-sky-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          {copyStatus === 'copied' ? 'Copied to Clipboard!' : copyStatus === 'error' ? 'Copy Failed!' : 'Copy Book (Markdown)'}
        </button>
        <button
          onClick={handleDownloadTxt}
          disabled={successfullyGeneratedChapters.length === 0}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Book (.txt)
        </button>
      </div>

      <div className="mt-8 space-y-10 prose prose-invert prose-lg max-w-none prose-headings:text-sky-400 prose-p:text-slate-300 prose-strong:text-slate-100">
        {successfullyGeneratedChapters.map((chapter) => (
          // The chapter.path.join(' / ') is still useful for the key and aria-labelledby if needed for accessibility,
          // but the visual title is now expected to be part of chapter.content.
          <section key={chapter.id} className="p-6 bg-slate-700/70 rounded-lg shadow-lg" aria-labelledby={`chapter-heading-internal-${chapter.id}`}>
            {/* 
              The H3 title previously rendered by the app is removed.
              The chapter.content itself should now start with "## Chapter Title" from the AI.
              The 'prose' styles will handle the H2 from the markdown content.
            */}
            <div id={`chapter-heading-internal-${chapter.id}`} className="whitespace-pre-wrap text-slate-200 leading-relaxed">
              {chapter.content}
            </div>
          </section>
        ))}
      </div>

       {successfullyGeneratedChapters.length === 0 && (
        <p className="text-center text-slate-400 py-10">No chapters have been generated or completed successfully.</p>
      )}

      <div className="mt-12 text-center">
        <button
          onClick={onStartOver}
          className="px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
        >
          Create Another Book
        </button>
      </div>
    </div>
  );
};

export default BookViewPane;