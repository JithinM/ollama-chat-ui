/**
 * Message Input Component
 * US-003
 * Layout: text area on top (auto-resize, scroll when long), all buttons in a row below.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileMetadata, FileFormat } from '@/types';
import type { Model } from '@/types';

interface MessageInputProps {
  onSend: (message: string, files?: FileMetadata[]) => Promise<void>;
  isSending: boolean;
  onModelSelect: (modelId: string) => void;
  currentModel: string;
  selectedModelId: string | null;
  models: Model[];
  modelsLoading?: boolean;
}

type CreativityLevel = 'Low' | 'Medium' | 'High';

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isSending,
  onModelSelect,
  currentModel,
  selectedModelId,
  models,
  modelsLoading = false,
}) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileMetadata[]>([]);
  const [creativity, setCreativity] = useState<CreativityLevel>('Medium');
  const [showCreativity, setShowCreativity] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const creativityRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    const textToSend = message;
    const filesToSend = [...attachedFiles];
    setMessage('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
    textareaRef.current?.focus();
    await onSend(textToSend, filesToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MIN_TEXTAREA_HEIGHT = 80;
  const MAX_TEXTAREA_HEIGHT = 320;

  const adjustTextareaHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const capped = Math.min(Math.max(ta.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
    ta.style.height = `${capped}px`;
    ta.style.overflowY = ta.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        creativityRef.current && !creativityRef.current.contains(e.target as Node) &&
        modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCreativity(false);
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getFileFormat = (fileType: string, fileName: string): FileFormat => {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('json')) return 'json';
    if (fileType.includes('csv')) return 'csv';
    if (fileType.includes('markdown') || fileName.endsWith('.md')) return 'md';
    if (fileType.includes('xml')) return 'code';
    return 'txt';
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) ?? '');
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const ACCEPTED_TYPES =
    '.txt,.md,.json,.csv,.xml,text/plain,text/markdown,text/csv,application/json,application/xml,text/xml';
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newFiles: FileMetadata[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) continue;
      const format = getFileFormat(file.type, file.name);
      let content: string | undefined;
      try {
        content = await readFileAsText(file);
      } catch {
        continue;
      }
      newFiles.push({
        id: `file-${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        format,
        content,
        isUploaded: true,
        uploadDate: new Date(),
      });
    }
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Attached files row */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center px-3 py-1.5 bg-gray-100 rounded-lg text-base"
            >
              <span className="text-gray-700 mr-2 truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="text-gray-400 hover:text-red-500 p-0.5"
                aria-label="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rounded container: text area on top, buttons row below (overflow-visible so dropdowns are not clipped) */}
      <div className="rounded-2xl bg-gray-100 border border-gray-200 shadow-sm overflow-visible">
        <div className="px-3 pt-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message"
            rows={1}
            style={{ minHeight: MIN_TEXTAREA_HEIGHT, maxHeight: MAX_TEXTAREA_HEIGHT }}
            className="w-full bg-transparent px-2 py-2 text-gray-800 placeholder-gray-500 resize-none focus:outline-none text-base overflow-y-auto block"
          />
        </div>
        <div className="flex items-center gap-2 px-3 pb-3 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Attach file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            title="Attach file"
            aria-label="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8h-16" />
            </svg>
          </button>

          <div className="relative flex-shrink-0" ref={creativityRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreativity(!showCreativity);
                setShowModelDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-base"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{creativity}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCreativity && (
              <div className="absolute bottom-full left-0 mb-1 py-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 min-w-[120px]">
                {(['Low', 'Medium', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setCreativity(level);
                      setShowCreativity(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-base hover:bg-gray-100 first:rounded-t-xl last:rounded-b-xl ${creativity === level ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-shrink-0 flex-1 min-w-0 flex justify-end">
            <div className="relative" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModelDropdown(!showModelDropdown);
                  setShowCreativity(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-base max-w-[180px]"
              >
                <span className="truncate">{modelsLoading ? 'Loading…' : currentModel}</span>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showModelDropdown && (
                <div className="absolute bottom-full right-0 mb-1 max-h-[min(320px,60vh)] overflow-y-auto py-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 min-w-[220px]">
                  {models.length === 0 ? (
                    <div className="px-4 py-3 text-base text-gray-500">No models loaded</div>
                  ) : (
                    models.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onModelSelect(m.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-base hover:bg-gray-100 first:rounded-t-xl last:rounded-b-xl truncate ${selectedModelId === m.id ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                      >
                        {m.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isSending || (!message.trim() && attachedFiles.length === 0)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
            aria-label="Send message"
          >
            {isSending ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.627z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
