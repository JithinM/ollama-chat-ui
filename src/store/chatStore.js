/**
 * Chat Store - Zustand
 * US-009
 * Manages chat state: sessions (Today/Older), current session messages, streaming, errors.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
function getSessionMessages(sessions = [], currentSessionId) {
    if (!currentSessionId)
        return [];
    const session = sessions.find((s) => s.id === currentSessionId);
    return session?.messages ?? [];
}
function getSessionTitle(messages) {
    const first = messages.find((m) => m.role === 'user')?.content?.trim() ?? '';
    return first ? (first.slice(0, 28) + (first.length > 28 ? '…' : '')) : 'New chat';
}
const createNewSession = () => ({
    id: `session-${Date.now()}`,
    title: 'New chat',
    createdAt: new Date().toISOString(),
    messages: [],
});
function persistedErrorToError(err) {
    if (err == null)
        return null;
    if (err instanceof Error)
        return err;
    if (typeof err === 'object' && err !== null && 'message' in err)
        return new Error(String(err.message));
    return null;
}
const createChatStore = create()(persist((set, get) => ({
    messages: [],
    currentMessage: null,
    isStreaming: false,
    error: null,
    sessions: [],
    currentSessionId: null,
    addMessage: (message) => {
        set((state) => {
            const sid = state.currentSessionId;
            let sessions = state.sessions;
            let currentSessionId = sid;
            if (!sid) {
                const newSession = createNewSession();
                newSession.messages = [message];
                sessions = [newSession];
                currentSessionId = newSession.id;
            }
            else {
                sessions = state.sessions.map((s) => s.id === sid ? { ...s, messages: [...s.messages, message] } : s);
            }
            const cur = sessions.find((s) => s.id === currentSessionId);
            return {
                sessions,
                currentSessionId,
                messages: cur?.messages ?? [],
            };
        });
    },
    updateMessage: (messageId, content) => {
        set((state) => {
            const sid = state.currentSessionId;
            if (!sid)
                return state;
            const sessions = state.sessions.map((s) => s.id === sid
                ? {
                    ...s,
                    messages: s.messages.map((msg) => msg.id === messageId ? { ...msg, content: msg.content + content } : msg),
                }
                : s);
            const cur = sessions.find((s) => s.id === sid);
            return { sessions, messages: cur?.messages ?? [] };
        });
    },
    setStreaming: (isStreaming) => set({ isStreaming }),
    setError: (error) => set({ error }),
    setMessages: (messages) => {
        set((state) => {
            const sid = state.currentSessionId;
            if (!sid)
                return state;
            const sessions = state.sessions.map((s) => s.id === sid ? { ...s, messages } : s);
            return { sessions, messages };
        });
    },
    clearHistory: async () => {
        get().startNewChat();
    },
    appendMessageContent: (messageId, content) => {
        set((state) => {
            const sid = state.currentSessionId;
            if (!sid)
                return state;
            const sessions = state.sessions.map((s) => s.id === sid
                ? {
                    ...s,
                    messages: s.messages.map((msg) => msg.id === messageId ? { ...msg, content: msg.content + content } : msg),
                }
                : s);
            const cur = sessions.find((s) => s.id === sid);
            return { sessions, messages: cur?.messages ?? [] };
        });
    },
    appendThinkingContent: (messageId, thinking) => {
        set((state) => {
            const sid = state.currentSessionId;
            if (!sid)
                return state;
            const sessions = state.sessions.map((s) => s.id === sid
                ? {
                    ...s,
                    messages: s.messages.map((msg) => msg.id === messageId ? { ...msg, thinking: (msg.thinking || '') + thinking } : msg),
                }
                : s);
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
                sessions = state.sessions.map((s) => s.id === sid ? { ...s, title } : s);
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
    setCurrentSession: (sessionId) => {
        set((state) => {
            const session = state.sessions.find((s) => s.id === sessionId);
            return {
                currentSessionId: sessionId,
                messages: session?.messages ?? [],
            };
        });
    },
    setSessionsFromServerList: (list) => {
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
            const sessions = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const currentId = state.currentSessionId;
            const messages = currentId ? (byId.get(currentId)?.messages ?? []) : state.messages;
            return { sessions, messages };
        });
    },
    setSessionAndSelect: (session) => {
        set((state) => {
            const existing = state.sessions.findIndex((s) => s.id === session.id);
            const sessions = existing >= 0
                ? state.sessions.map((s) => (s.id === session.id ? session : s))
                : [session, ...state.sessions];
            return {
                sessions,
                currentSessionId: session.id,
                messages: session.messages,
            };
        });
    },
    removeSession: (sessionId) => {
        set((state) => {
            const sessions = state.sessions.filter((s) => s.id !== sessionId);
            const wasCurrent = state.currentSessionId === sessionId;
            const nextId = wasCurrent && sessions.length > 0
                ? sessions[0].id
                : wasCurrent
                    ? null
                    : state.currentSessionId;
            const messages = nextId != null ? (sessions.find((s) => s.id === nextId)?.messages ?? []) : [];
            return {
                sessions,
                currentSessionId: nextId,
                messages,
            };
        });
    },
    updateSessionTitle: (sessionId, title) => {
        set((state) => ({
            sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, title: title.trim() || s.title } : s),
        }));
    },
}), {
    name: 'chat-storage',
    partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        error: state.error,
    }),
    merge: (persisted, current) => {
        const p = persisted;
        if (!p?.sessions) {
            const legacy = persisted;
            if (legacy?.messages?.length) {
                const session = {
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
}));
export const chatService = {
    sendMessage: async (message, options) => {
        const store = createChatStore.getState();
        const newMessage = {
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
    getHistory: async (params) => {
        const store = createChatStore.getState();
        return store.messages;
    },
    updateMessage: async (messageId, content) => {
        const store = createChatStore.getState();
        store.updateMessage(messageId, content);
    },
    clearHistory: async () => {
        const store = createChatStore.getState();
        store.startNewChat();
    },
};
export const useChatStore = createChatStore;
export default createChatStore;
