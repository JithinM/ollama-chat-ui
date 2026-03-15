/**
 * Chat Service
 * US-004, US-008
 * Handles chat operations and communication with the backend
 */

import { apiClient } from '@/utils/apiClient';
import type {
  Message,
  ChatOptions,
  HistoryParams,
  StreamResponse,
} from '@/types';

export class ChatService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message and receive a response
   */
  async sendMessage(
    message: string,
    options?: ChatOptions
  ): Promise<Message> {
    try {
      const response = await apiClient.post<StreamResponse>(
        `${this.baseUrl}/chat`,
        {
          message,
          modelId: options?.modelId,
          enableSearch: options?.enableSearch,
          files: options?.files,
        }
      );

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
    } catch (error) {
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }

  /**
   * Stream chat responses in real-time
   */
  async streamMessage(
    message: string,
    onChunk: (chunk: StreamResponse) => void,
    onComplete: (response: StreamResponse) => void
  ): Promise<void> {
    try {
      await apiClient.stream<StreamResponse>(
        `${this.baseUrl}/chat/stream`,
        { message },
        onChunk,
        onComplete
      );
    } catch (error) {
      throw new Error(`Failed to stream message: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieve conversation history
   */
  async getHistory(params?: HistoryParams): Promise<Message[]> {
    try {
      const response = await apiClient.get<{ messages: Message[] }>(
        `${this.baseUrl}/chat/history`,
        {
          params: {
            limit: params?.limit,
            offset: params?.offset,
            startDate: params?.startDate?.toISOString(),
            endDate: params?.endDate?.toISOString(),
          },
        }
      );

      return response.data.messages;
    } catch (error) {
      throw new Error(`Failed to retrieve history: ${(error as Error).message}`);
    }
  }

  /**
   * Update a chat message
   */
  async updateMessage(
    messageId: string,
    content: string
  ): Promise<void> {
    try {
      await apiClient.put(
        `${this.baseUrl}/chat/messages/${messageId}`,
        { content }
      );
    } catch (error) {
      throw new Error(`Failed to update message: ${(error as Error).message}`);
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory(): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/chat/history`);
    } catch (error) {
      throw new Error(`Failed to clear history: ${(error as Error).message}`);
    }
  }

  /**
   * Search within conversation history
   */
  async searchHistory(query: string): Promise<Message[]> {
    try {
      const response = await apiClient.post<{ messages: Message[] }>(
        `${this.baseUrl}/chat/search`,
        { query }
      );

      return response.data.messages;
    } catch (error) {
      throw new Error(`Failed to search history: ${(error as Error).message}`);
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
