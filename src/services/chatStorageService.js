/**
 * Chat storage service: load and save chats to the directory-backed API (JSON files).
 */
const CHATS_API = '/chats-api';
function normalizeMessage(m) {
    return {
        ...m,
        timestamp: typeof m.timestamp === 'string' ? new Date(m.timestamp) : (m.timestamp ?? new Date()),
    };
}
function normalizeSession(raw) {
    const messages = Array.isArray(raw.messages)
        ? raw.messages.map((m) => normalizeMessage(m))
        : [];
    return {
        id: raw.id,
        title: raw.title || 'New chat',
        createdAt: raw.createdAt || new Date().toISOString(),
        messages,
    };
}
export async function listChats() {
    const res = await fetch(`${CHATS_API}/chats`);
    if (!res.ok)
        throw new Error(`Failed to list chats: ${res.statusText}`);
    return res.json();
}
export async function loadChat(id) {
    const res = await fetch(`${CHATS_API}/chats/${encodeURIComponent(id)}`);
    if (!res.ok) {
        if (res.status === 404)
            throw new Error('Chat not found');
        throw new Error(`Failed to load chat: ${res.statusText}`);
    }
    const raw = await res.json();
    return normalizeSession(raw);
}
export async function saveChat(session) {
    const body = {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        messages: session.messages.map((m) => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        })),
    };
    const res = await fetch(`${CHATS_API}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`Failed to save chat: ${res.statusText}`);
    const raw = await res.json();
    return normalizeSession(raw);
}
export async function deleteChat(id) {
    const res = await fetch(`${CHATS_API}/chats/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204)
        throw new Error(`Failed to delete chat: ${res.statusText}`);
}
