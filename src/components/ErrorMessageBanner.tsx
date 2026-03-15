/**
 * Error Message Banner
 * US-011
 * Displays application/API errors with dismiss and recovery
 */

import React from 'react';

interface ErrorMessageBannerProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorMessageBanner: React.FC<ErrorMessageBannerProps> = ({
  message,
  onDismiss,
}) => (
  <div
    className="flex items-center justify-between gap-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg"
    role="alert"
  >
    <div className="flex items-center gap-3 min-w-0">
      <svg
        className="w-5 h-5 flex-shrink-0 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm text-red-800 truncate">{message}</p>
    </div>
    <button
      type="button"
      onClick={onDismiss}
      className="flex-shrink-0 p-1 rounded hover:bg-red-100 text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      aria-label="Dismiss error"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export default ErrorMessageBanner;
