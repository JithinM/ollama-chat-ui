/**
 * Model-related type definitions
 * US-005
 */

export type ModelStatus = 'active' | 'inactive' | 'error' | 'loading';

export type SearchProvider = 'google' | 'bing' | 'custom';

export type SearchDepth = 'basic' | 'standard' | 'deep';

export interface Model {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: ModelStatus;
  lastUsed?: Date;
  metadata?: ModelMetadata;
}

export interface ModelMetadata {
  parameters?: Record<string, unknown>;
  contextWindow?: number;
  supportedFormats?: string[];
  searchConfig?: SearchConfig;
  searchResults?: SearchResult[];
}

export interface ModelService {
  getModels: () => Promise<Model[]>;
  getModelById: (id: string) => Promise<Model | null>;
  selectModel: (id: string) => Promise<void>;
  checkHealth: (id: string) => Promise<HealthStatus>;
}

export interface HealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  error?: string;
}

export interface ModelSelectorState {
  models: Model[];
  selectedModel: Model | null;
  isLoading: boolean;
  error: Error | null;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  relevance: number;
}

export interface SearchConfig {
  enabled: boolean;
  provider: SearchProvider;
  searchDepth: SearchDepth;
  maxResults: number;
  apiKey?: string;
}

export interface SearchService {
  executeSearch: (
    query: string,
    config?: SearchConfig
  ) => Promise<SearchResult[]>;
  integrateWithResponse: (
    searchResults: SearchResult[]
  ) => string;
}
