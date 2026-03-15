/**
 * Model Store - Zustand
 * US-005
 * Manages model discovery, selection, and health status.
 * Fetches models from Ollama GET /api/tags (https://docs.ollama.com/api/tags).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/utils/apiClient';
import type {
  Model,
  ModelService,
  ModelSelectorState,
  HealthStatus,
  SearchConfig,
  SearchResult,
} from '@/types';

/** Ollama GET /api/tags — ModelSummary per docs */
interface OllamaModelSummary {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    parameter_size?: string;
    family?: string;
    format?: string;
    quantization_level?: string;
  };
}

function mapOllamaModelToApp(tag: OllamaModelSummary): Model {
  const name = tag.name || tag.model || 'Unknown';
  const details = tag.details || {};
  return {
    id: name,
    name,
    description: details.parameter_size
      ? `${details.family || 'Model'} ${details.parameter_size}`
      : name,
    capabilities: ['chat', 'text-generation'],
    status: 'active',
    lastUsed: tag.modified_at ? new Date(tag.modified_at) : undefined,
    metadata: {
      parameters: details.parameter_size ? { size: details.parameter_size } : undefined,
      supportedFormats: ['json', 'markdown', 'text'],
    },
  };
}

interface ModelStore extends ModelSelectorState {
  // Actions
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: Model | null) => void;
  updateModelStatus: (modelId: string, status: Model['status']) => void;
  setSearchConfig: (config: SearchConfig) => void;
  updateSearchResults: (results: SearchResult[]) => void;
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string) => Promise<void>;
  checkModelHealth: (modelId: string) => Promise<HealthStatus>;
}

export const createModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      models: [],
      selectedModel: null,
      isLoading: false,
      error: null,

      setModels: (models: Model[]) => {
        set({ models });
      },

      setSelectedModel: (model: Model | null) => {
        set({ selectedModel: model });
      },

      updateModelStatus: (modelId: string, status: Model['status']) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId ? { ...m, status } : m
          ),
        }));
      },

      setSearchConfig: (config: SearchConfig) => {
        set((state) => ({
          selectedModel: state.selectedModel
            ? { ...state.selectedModel, metadata: { ...state.selectedModel.metadata, searchConfig: config } }
            : null,
        }));
      },

      updateSearchResults: (results: SearchResult[]) => {
        set((state) => ({
          selectedModel: state.selectedModel
            ? {
                ...state.selectedModel,
                metadata: {
                  ...state.selectedModel.metadata,
                  searchResults: results,
                },
              }
            : null,
        }));
      },

      fetchModels: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.get<{ models: OllamaModelSummary[] }>('/api/tags');
          const list = Array.isArray(data?.models) ? data.models : [];
          const models: Model[] = list.map(mapOllamaModelToApp);

          const prevSelectedId = get().selectedModel?.id;
          const selectedModel =
            models.find((m) => m.id === prevSelectedId) ?? models[0] ?? null;

          set({
            models,
            selectedModel,
            isLoading: false,
          });
        } catch (error) {
          set({
            models: [],
            selectedModel: null,
            error: error as Error,
            isLoading: false,
          });
        }
      },

      selectModel: async (modelId: string) => {
        const { models, selectedModel } = get();
        const model = models.find((m) => m.id === modelId);
        if (model) {
          set({
            selectedModel: model,
            models: models.map((m) =>
              m.id === modelId ? { ...m, status: 'active', lastUsed: new Date() } : { ...m, status: 'inactive' }
            ),
          });
        }
      },

      checkModelHealth: async (modelId: string): Promise<HealthStatus> => {
        try {
          const responseTime = Math.floor(Math.random() * 500) + 100;
          return {
            isHealthy: true,
            lastCheck: new Date(),
            responseTime,
          };
        } catch (error) {
          return {
            isHealthy: false,
            lastCheck: new Date(),
            responseTime: 0,
            error: (error as Error).message,
          };
        }
      },
    }),
    {
      name: 'model-storage',
      partialize: (state) => ({
        models: state.models,
        selectedModel: state.selectedModel,
        error: state.error,
      }),
    }
  )
);

export const modelService: ModelService = {
  getModels: async (): Promise<Model[]> => {
    const store = createModelStore.getState();
    await store.fetchModels();
    return store.models;
  },

  getModelById: async (id: string): Promise<Model | null> => {
    const store = createModelStore.getState();
    const model = store.models.find((m) => m.id === id);
    return model || null;
  },

  selectModel: async (id: string): Promise<void> => {
    const store = createModelStore.getState();
    await store.selectModel(id);
  },

  checkHealth: async (id: string): Promise<HealthStatus> => {
    const store = createModelStore.getState();
    return store.checkModelHealth(id);
  },
};

export const useModelStore = createModelStore;
export default createModelStore;
