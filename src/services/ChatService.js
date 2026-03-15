/**
 * Chat Service
 * US-004, US-008
 * Handles chat operations and communication with the backend
 */
import { apiClient } from '@/utils/apiClient';
export class ChatService {
    constructor(baseUrl = 'http://localhost:8080/api') {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = baseUrl;
    }
    /**
     * Send a chat message and receive a response
     */
    async sendMessage(message, options) {
        try {
            const response = await apiClient.post(`${this.baseUrl}/chat`, {
                message,
                modelId: options?.modelId,
                enableSearch: options?.enableSearch,
                files: options?.files,
            });
            return {
                id: response.data.messageId,
                role: 'assistant',
                content: response.data.content,
                timestamp: new Date(),
                attachments: options?.files,
                metadata: {
                    model: response.data.metadata.model,
                    tokensUsed: response.data.metadata.tokensUsed,
                    duration: response.data.metadata.duration,
                    searchResults: response.data.metadata.searchResults,
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }
    /**
     * Stream chat responses in real-time
     */
    async streamMessage(message, onChunk, onComplete) {
        try {
            await apiClient.stream(`${this.baseUrl}/chat/stream`, { message }, onChunk, onComplete);
        }
        catch (error) {
            throw new Error(`Failed to stream message: ${error.message}`);
        }
    }
    /**
     * Retrieve conversation history
     */
    async getHistory(params) {
        try {
            const response = await apiClient.get(`${this.baseUrl}/chat/history`, {
                params: {
                    limit: params?.limit,
                    offset: params?.offset,
                    startDate: params?.startDate?.toISOString(),
                    endDate: params?.endDate?.toISOString(),
                },
            });
            return response.data.messages;
        }
        catch (error) {
            throw new Error(`Failed to retrieve history: ${error.message}`);
        }
    }
    /**
     * Update a chat message
     */
    async updateMessage(messageId, content) {
        try {
            await apiClient.put(`${this.baseUrl}/chat/messages/${messageId}`, { content });
        }
        catch (error) {
            throw new Error(`Failed to update message: ${error.message}`);
        }
    }
    /**
     * Clear conversation history
     */
    async clearHistory() {
        try {
            await apiClient.delete(`${this.baseUrl}/chat/history`);
        }
        catch (error) {
            throw new Error(`Failed to clear history: ${error.message}`);
        }
    }
    /**
     * Search within conversation history
     */
    async searchHistory(query) {
        try {
            const response = await apiClient.post(`${this.baseUrl}/chat/search`, { query });
            return response.data.messages;
        }
        catch (error) {
            throw new Error(`Failed to search history: ${error.message}`);
        }
    }
}
// Export singleton instance
export const chatService = new ChatService();
export default chatService;
