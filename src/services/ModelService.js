/**
 * Model Service
 * US-005
 * Handles model discovery, selection, and health monitoring
 */
import { apiClient } from '@/utils/apiClient';
export class ModelService {
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
     * Fetch all available models
     */
    async getModels() {
        try {
            const response = await apiClient.get(`${this.baseUrl}/models`);
            return response.data.models;
        }
        catch (error) {
            throw new Error(`Failed to fetch models: ${error.message}`);
        }
    }
    /**
     * Get a specific model by ID
     */
    async getModelById(id) {
        try {
            const response = await apiClient.get(`${this.baseUrl}/models/${id}`);
            return response.data.model;
        }
        catch (error) {
            throw new Error(`Failed to fetch model: ${error.message}`);
        }
    }
    /**
     * Select a model for use
     */
    async selectModel(id) {
        try {
            await apiClient.post(`${this.baseUrl}/models/${id}/select`, {});
        }
        catch (error) {
            throw new Error(`Failed to select model: ${error.message}`);
        }
    }
    /**
     * Check model health status
     */
    async checkHealth(id) {
        try {
            const response = await apiClient.get(`${this.baseUrl}/models/${id}/health`);
            return response.data.health;
        }
        catch (error) {
            return {
                isHealthy: false,
                lastCheck: new Date(),
                responseTime: 0,
                error: error.message,
            };
        }
    }
    /**
     * Execute web search and integrate with model response
     */
    async executeSearch(query, config) {
        try {
            const response = await apiClient.post(`${this.baseUrl}/search`, {
                query,
                config,
            });
            return response.data.results;
        }
        catch (error) {
            throw new Error(`Failed to execute search: ${error.message}`);
        }
    }
    /**
     * Integrate search results with model response
     */
    async integrateWithResponse(searchResults) {
        try {
            const response = await apiClient.post(`${this.baseUrl}/search/integrate`, { results: searchResults });
            return response.data.content;
        }
        catch (error) {
            throw new Error(`Failed to integrate search results: ${error.message}`);
        }
    }
    /**
     * Update search configuration
     */
    async updateSearchConfig(config) {
        try {
            await apiClient.put(`${this.baseUrl}/search/config`, config);
        }
        catch (error) {
            throw new Error(`Failed to update search config: ${error.message}`);
        }
    }
}
// Export singleton instance
export const modelService = new ModelService();
export default modelService;
