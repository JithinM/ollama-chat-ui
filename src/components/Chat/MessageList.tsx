/**
 * Message List Component
 * US-002
 * Displays chat messages with scrollable history. Assistant messages are rendered as Markdown.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { Message } from '@/types';

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 text-base leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2 text-gray-900 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1.5 text-gray-900 first:mt-0">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-base">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-base">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-3 my-2 text-gray-600 italic text-base">{children}</blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');
    if (match) {
      return (
        <SyntaxHighlighter
          PreTag="div"
          style={oneDark}
          language={match[1]}
          customStyle={{ margin: '0.5rem 0', borderRadius: '0.5rem', fontSize: '0.9375rem' }}
          codeTagProps={{ className: 'text-base' }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-sm" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-2">{children}</pre>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-gray-200" />,
};

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const copyToClipboard = useCallback((text: string, messageId: string) => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedId(null);
        copyTimeoutRef.current = null;
      }, 2000);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
      <div
        key={message.id}
        className={`flex ${
          isUser ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'
        } mb-6`}
      >
        {isSystem ? (
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {message.content}
          </div>
        ) : (
          <>
            {!isUser && (
              <div className="mr-3 flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl relative group ${
                isUser
                  ? 'bg-gray-200 text-gray-900 rounded-br-md'
                  : 'bg-white border border-gray-200 rounded-bl-md'
              }`}
            >
              <button
                type="button"
                onClick={() => copyToClipboard(message.content || '', message.id)}
                className="absolute top-2 right-2 p-1.5 rounded-md opacity-60 hover:opacity-100 group-hover:opacity-100 hover:bg-black/5 text-gray-500 hover:text-gray-700 transition-opacity"
                title="Copy to clipboard"
                aria-label="Copy to clipboard"
              >
                {copiedId === message.id ? (
                  <span className="text-xs font-medium text-green-600">Copied!</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              {isUser ? (
                <p className="whitespace-pre-wrap text-base leading-relaxed pr-10">
                  {message.content}
                </p>
              ) : (
                <div className="prose prose-base max-w-none text-gray-800 pr-10">
                  <ReactMarkdown components={markdownComponents}>
                    {message.content || ''}
                  </ReactMarkdown>
                </div>
              )}

              {message.attachments && message.attachments.length > 0 && (
                <div className={`mt-3 pt-3 border-t ${isUser ? 'border-gray-300' : 'border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center px-3 py-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <svg
                          className="w-5 h-5 text-blue-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-gray-700 text-base">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isUser && (
              <div className="ml-3 flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white">
      <div className="max-w-4xl mx-auto relative">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
            <p className="text-gray-500 text-center text-base mb-8">
              Send a message below to start the conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default MessageList;
