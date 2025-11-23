import React from 'react';

interface FinishPreviewProps {
  finish: string;
  className?: string;
}

export function FinishPreview({ finish, className = '' }: FinishPreviewProps) {
  const baseClasses = "flex items-center justify-center";
  
  switch (finish) {
    case 'classic-pointed':
      return (
        <div className={`${baseClasses} ${className}`}>
          {/* Pointed/Arrow shape */}
          <svg width="40" height="20" viewBox="0 0 40 20" className="text-foreground">
            <path
              d="M 0 0 L 20 20 L 40 0"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
      );
    
    case 'angled':
      return (
        <div className={`${baseClasses} ${className}`}>
          {/* Angled cut */}
          <svg width="40" height="20" viewBox="0 0 40 20" className="text-foreground">
            <path
              d="M 0 0 L 15 20 L 25 20 L 40 0"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
      );
    
    case 'horizontal-cut':
      return (
        <div className={`${baseClasses} ${className}`}>
          {/* Horizontal cut */}
          <svg width="40" height="20" viewBox="0 0 40 20" className="text-foreground">
            <rect
              x="0"
              y="0"
              width="40"
              height="20"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
      );
    
    default:
      return null;
  }
}
