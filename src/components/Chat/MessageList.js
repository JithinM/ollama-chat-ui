import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Message List Component
 * US-002
 * Displays chat messages with scrollable history. Assistant messages are rendered as Markdown.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
const markdownComponents = {
    p: ({ children }) => _jsx("p", { className: "mb-3 last:mb-0 text-base leading-relaxed", children: children }),
    strong: ({ children }) => _jsx("strong", { className: "font-semibold text-gray-900", children: children }),
    em: ({ children }) => _jsx("em", { className: "italic", children: children }),
    h1: ({ children }) => _jsx("h1", { className: "text-xl font-bold mt-4 mb-2 text-gray-900 first:mt-0", children: children }),
    h2: ({ children }) => _jsx("h2", { className: "text-lg font-bold mt-4 mb-2 text-gray-900 first:mt-0", children: children }),
    h3: ({ children }) => _jsx("h3", { className: "text-base font-bold mt-3 mb-1.5 text-gray-900 first:mt-0", children: children }),
    ul: ({ children }) => _jsx("ul", { className: "list-disc list-inside mb-3 space-y-1 text-base", children: children }),
    ol: ({ children }) => _jsx("ol", { className: "list-decimal list-inside mb-3 space-y-1 text-base", children: children }),
    li: ({ children }) => _jsx("li", { className: "leading-relaxed", children: children }),
    blockquote: ({ children }) => (_jsx("blockquote", { className: "border-l-4 border-gray-300 pl-3 my-2 text-gray-600 italic text-base", children: children })),
    code: ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const code = String(children).replace(/\n$/, '');
        if (match) {
            return (_jsx(SyntaxHighlighter, { PreTag: "div", style: oneDark, language: match[1], customStyle: { margin: '0.5rem 0', borderRadius: '0.5rem', fontSize: '0.9375rem' }, codeTagProps: { className: 'text-base' }, children: code }));
        }
        return (_jsx("code", { className: "px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-sm", ...props, children: children }));
    },
    pre: ({ children }) => _jsx("pre", { className: "my-2", children: children }),
    a: ({ href, children }) => (_jsx("a", { href: href, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: children })),
    hr: () => _jsx("hr", { className: "my-3 border-gray-200" }),
};
export const MessageList = ({ messages, isStreaming, }) => {
    const messagesEndRef = useRef(null);
    const [copiedId, setCopiedId] = useState(null);
    const copyTimeoutRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]);
    const copyToClipboard = useCallback((text, messageId) => {
        if (copyTimeoutRef.current)
            clearTimeout(copyTimeoutRef.current);
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
            if (copyTimeoutRef.current)
                clearTimeout(copyTimeoutRef.current);
        };
    }, []);
    const formatTimestamp = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const formatDuration = (ms) => {
        const seconds = ms / 1000;
        if (seconds < 60) {
            return seconds < 1 ? `${Math.round(ms)}ms` : `${seconds.toFixed(1)}s`;
        }
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        return s > 0 ? `${m}m ${s}s` : `${m}m`;
    };
    const renderMessage = (message) => {
        const isUser = message.role === 'user';
        const isSystem = message.role === 'system';
        return (_jsx("div", { className: `flex ${isUser ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'} mb-6`, children: isSystem ? (_jsx("div", { className: "text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full", children: message.content })) : (_jsxs(_Fragment, { children: [!isUser && (_jsx("div", { className: "mr-3 flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" }) }) }) })), _jsxs("div", { className: `max-w-2xl px-4 py-3 rounded-2xl relative group ${isUser
                            ? 'bg-gray-200 text-gray-900 rounded-br-md'
                            : 'bg-white border border-gray-200 rounded-bl-md'}`, children: [_jsx("button", { type: "button", onClick: () => copyToClipboard(message.content || '', message.id), className: "absolute top-2 right-2 p-1.5 rounded-md opacity-60 hover:opacity-100 group-hover:opacity-100 hover:bg-black/5 text-gray-500 hover:text-gray-700 transition-opacity", title: "Copy to clipboard", "aria-label": "Copy to clipboard", children: copiedId === message.id ? (_jsx("span", { className: "text-xs font-medium text-green-600", children: "Copied!" })) : (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) })) }), isUser ? (_jsx("p", { className: "whitespace-pre-wrap text-base leading-relaxed pr-10", children: message.content })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "prose prose-base max-w-none text-gray-800 pr-10", children: _jsx(ReactMarkdown, { components: markdownComponents, children: message.content || '' }) }), message.metadata && (message.metadata.tokensUsed != null || (message.metadata.duration != null && message.metadata.duration > 0)) && (_jsxs("div", { className: "mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500", children: [message.metadata.duration != null && message.metadata.duration > 0 && (_jsxs("span", { title: "Total time", children: ["\u23F1 ", formatDuration(message.metadata.duration)] })), message.metadata.tokensUsed != null && (_jsxs("span", { title: "Tokens generated", children: [message.metadata.tokensUsed, " tokens"] })), message.metadata.tokensUsed != null && message.metadata.duration != null && message.metadata.duration > 0 && (_jsxs("span", { title: "Tokens per second", children: [((message.metadata.tokensUsed / (message.metadata.duration / 1000))).toFixed(1), " tok/s"] }))] }))] })), message.attachments && message.attachments.length > 0 && (_jsx("div", { className: `mt-3 pt-3 border-t ${isUser ? 'border-gray-300' : 'border-gray-200'}`, children: _jsx("div", { className: "flex flex-wrap gap-2", children: message.attachments.map((file) => (_jsxs("div", { className: "flex items-center px-3 py-2 bg-gray-50 rounded-lg text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-blue-600 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), _jsx("span", { className: "text-gray-700 text-base", children: file.name })] }, file.id))) }) }))] }), isUser && (_jsx("div", { className: "ml-3 flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }) }))] })) }, message.id));
    };
    return (_jsx("div", { className: "flex-1 overflow-y-auto p-6 bg-white", children: _jsx("div", { className: "max-w-4xl mx-auto relative", children: messages.length === 0 ? (_jsx("div", { className: "flex flex-col items-center justify-center min-h-[50vh] py-12", children: _jsx("p", { className: "text-gray-500 text-center text-base mb-8", children: "Send a message below to start the conversation." }) })) : (_jsxs(_Fragment, { children: [messages.map(renderMessage), _jsx("div", { ref: messagesEndRef })] })) }) }));
};
export default MessageList;
