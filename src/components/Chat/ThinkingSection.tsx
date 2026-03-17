/**
 * Thinking Section Component
 * Displays the model's thinking/reasoning process in a collapsible section
 * Default state: collapsed
 */

import React from 'react';

interface ThinkingSectionProps {
  thinking: string;
  isStreaming?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  thinking,
  isStreaming = false,
  isExpanded = false,
  onToggle,
}) => {
  if (!thinking) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1m4 0v-1m0 1h-1m1 0v-1m-1 1l-.707.707M3 12h1m-4 0v1m0-1h1m-1 0v-1m1 0l-.707-.707M12 11.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        </svg>
        <span className="text-sm font-medium text-gray-600">Thinking</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {isStreaming && (
          <span className="ml-auto">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </span>
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 leading-relaxed">
          {thinking}
          {isStreaming && <span className="inline-block w-0.5 h-4 bg-gray-400 ml-1 animate-pulse"></span>}
        </div>
      )}
    </div>
  );
};

export default ThinkingSection;
