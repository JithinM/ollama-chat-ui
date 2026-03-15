import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Main Application Component
 * US-002, US-003, US-004, US-005, US-008, US-009
 * Orchestrates all components and services. Chat uses Ollama POST /api/chat.
 */
import { useEffect, useRef } from 'react';
import { useChatStore, useConfigStore, useModelStore } from '@/store';
import { ChatInterface } from '@/components/Chat/ChatInterface';
import { apiClient } from '@/utils/apiClient';
import { listChats, saveChat } from '@/services/chatStorageService';
function getSessionTitle(messages) {
    const first = messages.find((m) => m.role === 'user')?.content?.trim() ?? '';
    return first ? first.slice(0, 28) + (first.length > 28 ? '…' : '') : 'New chat';
}
const App = () => {
    const { messages, isStreaming, addMessage, setStreaming, setError, sessions, currentSessionId, setSessionsFromServerList, } = useChatStore();
    const saveTimeoutRef = useRef(null);
    const { testConnection } = useConfigStore();
    const { selectedModel, fetchModels, selectModel } = useModelStore();
    // Initialize: test connection, fetch models, load chat list from directory
    useEffect(() => {
        const initializeApp = async () => {
            try {
                await testConnection();
            }
            catch {
                // Connection test failed; still try to fetch models
            }
            try {
                await fetchModels();
            }
            catch (error) {
                setError(error);
            }
            try {
                const list = await listChats();
                setSessionsFromServerList(list);
            }
            catch {
                // Chats server not running or not configured; continue with local sessions only
            }
        };
        initializeApp();
    }, [testConnection, fetchModels, setError, setSessionsFromServerList]);
    // Debounced save of current session to directory (JSON files)
    useEffect(() => {
        if (!currentSessionId || messages.length === 0)
            return;
        if (saveTimeoutRef.current)
            clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            const state = useChatStore.getState();
            const { messages: msgs, sessions: sess, currentSessionId: sid } = state;
            if (!sid || msgs.length === 0)
                return;
            const createdAt = sess.find((s) => s.id === sid)?.createdAt ?? new Date().toISOString();
            saveChat({
                id: sid,
                title: getSessionTitle(msgs),
                createdAt,
                messages: msgs,
            }).catch((e) => console.warn('Failed to save chat to directory', e));
            saveTimeoutRef.current = null;
        }, 1500);
        return () => {
            if (saveTimeoutRef.current)
                clearTimeout(saveTimeoutRef.current);
        };
    }, [currentSessionId, messages.length, sessions]);
    // Handle message submission — send to Ollama POST /api/chat with streaming
    const handleSendMessage = async (message, files) => {
        if (!selectedModel?.id) {
            setError(new Error('Select a model in Settings first'));
            return;
        }
        setStreaming(true);
        const userMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date(),
            attachments: files,
            metadata: {
                model: selectedModel.id,
                tokensUsed: 0,
                duration: 0,
            },
        };
        addMessage(userMessage);
        const aiMessageId = `msg-${Date.now()}-ai`;
        const aiMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            metadata: {
                model: selectedModel.id,
                tokensUsed: 0,
                duration: 0,
            },
        };
        addMessage(aiMessage);
        const attachmentBlock = files?.length && files.some((f) => f.content)
            ? '\n\n' +
                files
                    .filter((f) => f.content)
                    .map((f) => `[File: ${f.name}]\n${f.content}`)
                    .join('\n\n')
            : '';
        const userContent = message.trim() + attachmentBlock;
        const ollamaMessages = [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userContent },
        ];
        const body = {
            model: selectedModel.id,
            messages: ollamaMessages,
            stream: true,
        };
        try {
            const { appendMessageContent } = useChatStore.getState();
            let lastChunk = null;
            await apiClient.postStream('/api/chat', body, (chunk) => {
                if (chunk.message?.content) {
                    appendMessageContent(aiMessageId, chunk.message.content);
                }
                if (chunk.done) {
                    lastChunk = chunk;
                }
            });
            // Update metadata on the assistant message when stream completes (Ollama API: total_duration, prompt_eval_count, eval_count, etc.)
            const store = useChatStore.getState();
            const totalDurationNs = lastChunk?.total_duration;
            const promptEvalCount = lastChunk?.prompt_eval_count ?? 0;
            const evalCount = lastChunk?.eval_count ?? 0;
            const promptEvalDurationNs = lastChunk?.prompt_eval_duration;
            const evalDurationNs = lastChunk?.eval_duration;
            const loadDurationNs = lastChunk?.load_duration;
            const doneReason = lastChunk?.done_reason;
            const updated = store.messages.map((m) => m.id === aiMessageId
                ? {
                    ...m,
                    metadata: {
                        ...m.metadata,
                        model: selectedModel.id,
                        tokensUsed: evalCount,
                        duration: totalDurationNs != null ? Math.round(totalDurationNs / 1e6) : 0,
                        responseMetrics: (totalDurationNs != null || promptEvalCount > 0 || evalCount > 0) ? {
                            totalDurationNs,
                            promptEvalCount,
                            evalCount,
                            promptEvalDurationNs,
                            evalDurationNs,
                            loadDurationNs,
                            doneReason,
                        } : undefined,
                    },
                }
                : m);
            useChatStore.setState({ messages: updated });
        }
        catch (error) {
            setError(error);
        }
        finally {
            setStreaming(false);
        }
    };
    // Handle model changes
    const handleModelChange = async (modelId) => {
        await selectModel(modelId);
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsx(ChatInterface, { messages: messages, selectedModel: selectedModel?.name || 'Select a Model', onSendMessage: handleSendMessage, onModelChange: handleModelChange, isStreaming: isStreaming }) }));
};
export default App;
