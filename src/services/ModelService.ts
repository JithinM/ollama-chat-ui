/**
 * Model Service
 * US-005
 * Handles model discovery, selection, and health monitoring
 */

import { apiClient } from '@/utils/apiClient';
import type {
  Model,
  ModelService as IModelService,
  HealthStatus,
  SearchConfig,
  SearchResult,
} from '@/types';

export class ModelService implements IModelService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all available models
   */
  async getModels(): Promise<Model[]> {
    try {
      const response = await apiClient.get<{ models: Model[] }>(
        `${this.baseUrl}/models`
      );

      return response.data.models;
    } catch (error) {
      throw new Error(`Failed to fetch models: ${(error as Error).message}`);
    }
  }

  /**
   * Get a specific model by ID
   */
  async getModelById(id: string): Promise<Model | null> {
    try {
      const response = await apiClient.get<{ model: Model }>(
        `${this.baseUrl}/models/${id}`
      );

      return response.data.model;
    } catch (error) {
      throw new Error(`Failed to fetch model: ${(error as Error).message}`);
    }
  }

  /**
   * Select a model for use
   */
  async selectModel(id: string): Promise<void> {
    try {
      await apiClient.post(
        `${this.baseUrl}/models/${id}/select`,
        {}
      );
    } catch (error) {
      throw new Error(`Failed to select model: ${(error as Error).message}`);
    }
  }

  /**
   * Check model health status
   */
  async checkHealth(id: string): Promise<HealthStatus> {
    try {
      const response = await apiClient.get<{ health: HealthStatus }>(
        `${this.baseUrl}/models/${id}/health`
      );

      return response.data.health;
    } catch (error) {
      return {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime: 0,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Execute web search and integrate with model response
   */
  async executeSearch(
    query: string,
    config?: SearchConfig
  ): Promise<SearchResult[]> {
    try {
      const response = await apiClient.post<{ results: SearchResult[] }>(
        `${this.baseUrl}/search`,
        {
          query,
          config,
        }
      );

      return response.data.results;
    } catch (error) {
      throw new Error(`Failed to execute search: ${(error as Error).message}`);
    }
  }

  /**
   * Integrate search results with model response
   */
  async integrateWithResponse(
    searchResults: SearchResult[]
  ): Promise<string> {
    try {
      const response = await apiClient.post<{ content: string }>(
        `${this.baseUrl}/search/integrate`,
        { results: searchResults }
      );

      return response.data.content;
    } catch (error) {
      throw new Error(`Failed to integrate search results: ${(error as Error).message}`);
    }
  }

  /**
   * Update search configuration
   */
  async updateSearchConfig(config: SearchConfig): Promise<void> {
    try {
      await apiClient.put(
        `${this.baseUrl}/search/config`,
        config
      );
    } catch (error) {
      throw new Error(`Failed to update search config: ${(error as Error).message}`);
    }
  }
}

// Export singleton instance
export const modelService = new ModelService();
export default modelService;
