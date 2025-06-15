
import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-4">
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-sky-500 ${sizeClasses[size]}`}
      ></div>
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
};

export default LoadingIndicator;
    