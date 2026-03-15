/**
 * Chat-related type definitions
 * US-002, US-003, US-008
 */

import type { FileMetadata } from './file.types';
import type { SearchResult } from './model.types';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  attachments?: FileMetadata[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  tokensUsed?: number;
  duration?: number;
  searchResults?: SearchResult[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string; // ISO date string for persist
  messages: Message[];
}

export interface ChatState {
  messages: Message[];
  currentMessage: Message | null;
  isStreaming: boolean;
  error: Error | null;
  /** Sessions for sidebar (Today / Older). When set, messages come from current session. */
  sessions?: ChatSession[];
  currentSessionId?: string | null;
}

export interface ChatService {
  sendMessage: (
    message: string,
    options?: ChatOptions
  ) => Promise<Message>;
  getHistory: (params?: HistoryParams) => Promise<Message[]>;
  updateMessage: (
    messageId: string,
    content: string
  ) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export interface ChatOptions {
  enableSearch?: boolean;
  files?: FileMetadata[];
  modelId?: string;
}

export interface HistoryParams {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface StreamResponse {
  messageId: string;
  content: string;
  isComplete: boolean;
  metadata: StreamMetadata;
}

export interface StreamMetadata {
  model: string;
  tokensUsed: number;
  duration: number;
  searchResults?: SearchResult[];
}

export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
