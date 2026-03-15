/**
 * Chat Interface Component
 * US-002
 * Main chat interface with message display and layout
 */

import React, { useState, useRef } from 'react';
import { Message } from '@/types';
import { useChatStore, useModelStore } from '@/store';
import { loadChat, saveChat, deleteChat, renameChat } from '@/services/chatStorageService';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ErrorMessageBanner } from '@/components/ErrorMessageBanner';
import { ServerConfigPanel, ModelSelectorPanel, SearchSettingsPanel } from '@/components/Settings';

interface ChatInterfaceProps {
  messages: Message[];
  selectedModel: string;
  onSendMessage: (message: string, files?: any[]) => Promise<void>;
  onModelChange: (modelId: string) => void;
  onNewChat?: () => void;
  isStreaming: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  selectedModel,
  onSendMessage,
  onModelChange,
  onNewChat,
  isStreaming,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const {
    error: chatError,
    setError: setChatError,
    sessions,
    currentSessionId,
    startNewChat,
    setCurrentSession,
    setSessionAndSelect,
    removeSession,
    updateSessionTitle,
  } = useChatStore();
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const { models, selectedModel: selectedModelObj, isLoading: modelsLoading } = useModelStore();

  const handleSendMessage = async (message: string, files?: any[]) => {
    await onSendMessage(message, files);
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
  };

  const handleNewChat = async () => {
    const state = useChatStore.getState();
    const { currentSessionId: sid, sessions: sess, messages: msgs } = state;
    if (sid && msgs.length > 0) {
      const first = msgs.find((m) => m.role === 'user')?.content?.trim() ?? '';
      const title = first ? first.slice(0, 28) + (first.length > 28 ? '…' : '') : 'New chat';
      const createdAt = sess.find((s) => s.id === sid)?.createdAt ?? new Date().toISOString();
      try {
        await saveChat({ id: sid, title, createdAt, messages: msgs });
      } catch (e) {
        console.warn('Failed to save chat before new chat', e);
      }
    }
    startNewChat();
    onNewChat?.();
  };

  const handleSelectChat = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    if (editingSessionId) return;
    setLoadingSessionId(sessionId);
    try {
      const session = await loadChat(sessionId);
      setSessionAndSelect(session);
    } catch {
      setCurrentSession(sessionId);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleRenameStart = (session: { id: string; title: string }) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title || 'New chat');
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleRenameSave = async () => {
    if (!editingSessionId || !editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    const newTitle = editTitle.trim();
    try {
      await renameChat(editingSessionId, newTitle);
      updateSessionTitle(editingSessionId, newTitle);
    } catch (e) {
      console.warn('Failed to rename chat', e);
      setChatError(e instanceof Error ? e : new Error('Failed to rename chat'));
    }
    setEditingSessionId(null);
  };

  const handleRenameCancel = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Delete this chat? This cannot be undone.')) return;
    try {
      await deleteChat(sessionId);
    } catch (e) {
      console.warn('Failed to delete chat on server', e);
    }
    const wasCurrent = currentSessionId === sessionId;
    const remaining = (sessions ?? []).filter((s) => s.id !== sessionId);
    removeSession(sessionId);
    if (wasCurrent && remaining.length === 0) startNewChat();
  };

  const startOfToday = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isToday = (isoDate: string) => new Date(isoDate) >= startOfToday();

  const todaySessions = (sessions ?? []).filter((s) => isToday(s.createdAt));
  const olderSessions = (sessions ?? []).filter((s) => !isToday(s.createdAt));
  const sortedToday = [...todaySessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedOlder = [...olderSessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getDisplayTitle = (session: { id: string; title: string }) => {
    if (session.id !== currentSessionId) return session.title || 'New chat';
    const first = messages.find((m) => m.role === 'user')?.content?.trim() ?? '';
    return first ? (first.slice(0, 28) + (first.length > 28 ? '…' : '')) : (session.title || 'New chat');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar - chat list */}
      <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-base font-medium">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="overflow-y-auto space-y-4 px-2">
            {sortedToday.length > 0 && (
              <div>
                <h2 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Today
                </h2>
                <div className="space-y-0.5">
                  {sortedToday.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-1 rounded-lg ${
                        currentSessionId === session.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                      } ${loadingSessionId === session.id ? 'opacity-60' : ''}`}
                    >
                      {editingSessionId === session.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleRenameSave}
                          onKeyDown={handleRenameKeyDown}
                          className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectChat(session.id)}
                            disabled={loadingSessionId === session.id}
                            className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg text-base transition-colors truncate ${
                              currentSessionId === session.id ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {loadingSessionId === session.id ? '…' : getDisplayTitle(session)}
                          </button>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(session);
                              }}
                              className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              title="Rename"
                              aria-label="Rename chat"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                              }}
                              className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                              aria-label="Delete chat"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sortedOlder.length > 0 && (
              <div>
                <h2 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Older
                </h2>
                <div className="space-y-0.5">
                  {sortedOlder.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-1 rounded-lg ${
                        currentSessionId === session.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                      } ${loadingSessionId === session.id ? 'opacity-60' : ''}`}
                    >
                      {editingSessionId === session.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleRenameSave}
                          onKeyDown={handleRenameKeyDown}
                          className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectChat(session.id)}
                            disabled={loadingSessionId === session.id}
                            className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg text-base transition-colors truncate ${
                              currentSessionId === session.id ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {loadingSessionId === session.id ? '…' : getDisplayTitle(session)}
                          </button>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(session);
                              }}
                              className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              title="Rename"
                              aria-label="Rename chat"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                              }}
                              className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                              aria-label="Delete chat"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sortedToday.length === 0 && sortedOlder.length === 0 && (
              <p className="px-3 text-sm text-gray-400">No chats yet</p>
            )}
          </div>
        </div>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setActiveTab(activeTab === 'settings' ? 'chat' : 'settings')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-base transition-colors ${
              activeTab === 'settings' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-base">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        {chatError && (
          <div className="px-4 pt-4 flex-shrink-0">
            <ErrorMessageBanner
              message={chatError instanceof Error ? chatError.message : (chatError as { message?: string }).message ?? 'An error occurred'}
              onDismiss={() => setChatError(null)}
            />
          </div>
        )}
        {activeTab === 'chat' ? (
          <>
            <MessageList messages={messages} isStreaming={isStreaming} />
            <div className="flex-shrink-0 p-4">
              <MessageInput
                onSend={handleSendMessage}
                isSending={isStreaming}
                onModelSelect={handleModelSelect}
                currentModel={selectedModel}
                selectedModelId={selectedModelObj?.id ?? null}
                models={models}
                modelsLoading={modelsLoading}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 p-8 overflow-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
            <div className="space-y-8">
              <ServerConfigPanel />
              <ModelSelectorPanel />
              <SearchSettingsPanel />
            </div>
          </div>
        )}
      </main>

      {/* Streaming Indicator */}
      {isStreaming && <TypingIndicator />}
    </div>
  );
};

export default ChatInterface;
