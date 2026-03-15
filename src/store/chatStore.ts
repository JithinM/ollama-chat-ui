/**
 * Chat Store - Zustand
 * US-009
 * Manages chat state: sessions (Today/Older), current session messages, streaming, errors.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChatState,
  Message,
  ChatService,
  ChatOptions,
  HistoryParams,
  StreamResponse,
  ChatSession,
} from '@/types';

function getSessionMessages(
  sessions: ChatSession[] = [],
  currentSessionId: string | null
): Message[] {
  if (!currentSessionId) return [];
  const session = sessions.find((s) => s.id === currentSessionId);
  return session?.messages ?? [];
}

function getSessionTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user')?.content?.trim() ?? '';
  return first ? (first.slice(0, 28) + (first.length > 28 ? '…' : '')) : 'New chat';
}

export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatStore extends ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setError: (error: Error | null) => void;
  setMessages: (messages: Message[]) => void;
  clearHistory: () => void;
  appendMessageContent: (messageId: string, content: string) => void;
  startNewChat: () => void;
  setCurrentSession: (sessionId: string) => void;
  /** Merge server list (from JSON directory) into sessions; keeps existing messages for sessions we have. */
  setSessionsFromServerList: (list: ChatSummary[]) => void;
  /** Load a full session (e.g. from server) and set as current. */
  setSessionAndSelect: (session: ChatSession) => void;
  /** Remove a session from state; if it was current, switch to another or new chat. */
  removeSession: (sessionId: string) => void;
  /** Update only the title of a session in state. */
  updateSessionTitle: (sessionId: string, title: string) => void;
}

const createNewSession = (): ChatSession => ({
  id: `session-${Date.now()}`,
  title: 'New chat',
  createdAt: new Date().toISOString(),
  messages: [],
});

type Persisted = { sessions: ChatSession[]; currentSessionId: string | null; error?: unknown };

function persistedErrorToError(err: unknown): Error | null {
  if (err == null) return null;
  if (err instanceof Error) return err;
  if (typeof err === 'object' && err !== null && 'message' in err) return new Error(String((err as { message?: unknown }).message));
  return null;
}

const createChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      currentMessage: null,
      isStreaming: false,
      error: null,
      sessions: [],
      currentSessionId: null,

      addMessage: (message: Message) => {
        set((state) => {
          const sid = state.currentSessionId;
          let sessions = state.sessions;
          let currentSessionId = sid;

          if (!sid) {
            const newSession = createNewSession();
            newSession.messages = [message];
            sessions = [newSession];
            currentSessionId = newSession.id;
          } else {
            sessions = state.sessions.map((s) =>
              s.id === sid ? { ...s, messages: [...s.messages, message] } : s
            );
          }

          const cur = sessions.find((s) => s.id === currentSessionId);
          return {
            sessions,
            currentSessionId,
            messages: cur?.messages ?? [],
          };
        });
      },

      updateMessage: (messageId: string, content: string) => {
        set((state) => {
          const sid = state.currentSessionId;
          if (!sid) return state;
          const sessions = state.sessions.map((s) =>
            s.id === sid
              ? {
                  ...s,
                  messages: s.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content: msg.content + content } : msg
                  ),
                }
              : s
          );
          const cur = sessions.find((s) => s.id === sid);
          return { sessions, messages: cur?.messages ?? [] };
        });
      },

      setStreaming: (isStreaming: boolean) => set({ isStreaming }),
      setError: (error: Error | null) => set({ error }),

      setMessages: (messages: Message[]) => {
        set((state) => {
          const sid = state.currentSessionId;
          if (!sid) return state;
          const sessions = state.sessions.map((s) =>
            s.id === sid ? { ...s, messages } : s
          );
          return { sessions, messages };
        });
      },

      clearHistory: async () => {
        get().startNewChat();
      },

      appendMessageContent: (messageId: string, content: string) => {
        set((state) => {
          const sid = state.currentSessionId;
          if (!sid) return state;
          const sessions = state.sessions.map((s) =>
            s.id === sid
              ? {
                  ...s,
                  messages: s.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content: msg.content + content } : msg
                  ),
                }
              : s
          );
          const cur = sessions.find((s) => s.id === sid);
          return { sessions, messages: cur?.messages ?? [] };
        });
      },

      startNewChat: () => {
        set((state) => {
          const sid = state.currentSessionId;
          let sessions = state.sessions;

          if (sid && state.messages.length > 0) {
            const title = getSessionTitle(state.messages);
            sessions = state.sessions.map((s) =>
              s.id === sid ? { ...s, title } : s
            );
          }

          const newSession = createNewSession();
          const newSessions = [...sessions, newSession];
          return {
            sessions: newSessions,
            currentSessionId: newSession.id,
            messages: [],
            currentMessage: null,
            error: null,
          };
        });
      },

      setCurrentSession: (sessionId: string) => {
        set((state) => {
          const session = state.sessions.find((s) => s.id === sessionId);
          return {
            currentSessionId: sessionId,
            messages: session?.messages ?? [],
          };
        });
      },

      setSessionsFromServerList: (list: ChatSummary[]) => {
        set((state) => {
          const byId = new Map(state.sessions.map((s) => [s.id, s]));
          for (const item of list) {
            const existing = byId.get(item.id);
            byId.set(item.id, {
              id: item.id,
              title: item.title,
              createdAt: item.createdAt,
              messages: existing?.messages ?? [],
            });
          }
          const sessions = Array.from(byId.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const currentId = state.currentSessionId;
          const messages = currentId ? (byId.get(currentId)?.messages ?? []) : state.messages;
          return { sessions, messages };
        });
      },

      setSessionAndSelect: (session: ChatSession) => {
        set((state) => {
          const existing = state.sessions.findIndex((s) => s.id === session.id);
          const sessions =
            existing >= 0
              ? state.sessions.map((s) => (s.id === session.id ? session : s))
              : [session, ...state.sessions];
          return {
            sessions,
            currentSessionId: session.id,
            messages: session.messages,
          };
        });
      },

      removeSession: (sessionId: string) => {
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== sessionId);
          const wasCurrent = state.currentSessionId === sessionId;
          const nextId =
            wasCurrent && sessions.length > 0
              ? sessions[0].id
              : wasCurrent
                ? null
                : state.currentSessionId;
          const messages =
            nextId != null ? (sessions.find((s) => s.id === nextId)?.messages ?? []) : [];
          return {
            sessions,
            currentSessionId: nextId,
            messages,
          };
        });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, title: title.trim() || s.title } : s
          ),
        }));
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state): Persisted => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        error: state.error,
      }),
      merge: (persisted, current) => {
        const p = persisted as Persisted | undefined;
        if (!p?.sessions) {
          const legacy = persisted as { messages?: Message[] } | undefined;
          if (legacy?.messages?.length) {
            const session: ChatSession = {
              id: `session-${Date.now()}`,
              title: getSessionTitle(legacy.messages),
              createdAt: new Date().toISOString(),
              messages: legacy.messages,
            };
            return {
              ...current,
              sessions: [session],
              currentSessionId: session.id,
              messages: session.messages,
              error: persistedErrorToError(p?.error) ?? current.error,
            };
          }
          return current;
        }
        const sessions = p.sessions;
        const currentSessionId = p.currentSessionId ?? null;
        const messages = getSessionMessages(sessions, currentSessionId);
        return {
          ...current,
          sessions,
          currentSessionId,
          messages,
          error: persistedErrorToError(p.error) ?? current.error,
        };
      },
    }
  )
);

export const chatService: ChatService = {
  sendMessage: async (message: string, options?: ChatOptions): Promise<Message> => {
    const store = createChatStore.getState();
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: options?.files,
      metadata: {
        model: options?.modelId,
        tokensUsed: 0,
        duration: 0,
      },
    };

    store.addMessage(newMessage);
    return newMessage;
  },

  getHistory: async (params?: HistoryParams): Promise<Message[]> => {
    const store = createChatStore.getState();
    return store.messages;
  },

  updateMessage: async (messageId: string, content: string): Promise<void> => {
    const store = createChatStore.getState();
    store.updateMessage(messageId, content);
  },

  clearHistory: async (): Promise<void> => {
    const store = createChatStore.getState();
    store.startNewChat();
  },
};

export const useChatStore = createChatStore;
export default createChatStore;
