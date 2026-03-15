/**
 * Model Selector Component
 * US-005
 * Handles model discovery, selection, and display
 */

import React, { useEffect, useState } from 'react';
import { useModelStore } from '@/store/modelStore';
import type { Model } from '@/types';

export const ModelSelectorPanel: React.FC = () => {
  const { models, selectedModel, isLoading, error, fetchModels, selectModel, checkModelHealth } = useModelStore();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    if (selectedModel) {
      setSelectedModelId(selectedModel.id);
    }
  }, [selectedModel]);

  const handleModelSelect = async (modelId: string) => {
    await selectModel(modelId);
    setSelectedModelId(modelId);
    
    const health = await checkModelHealth(modelId);
    setHealthStatus((prev) => ({
      ...prev,
      [modelId]: health.isHealthy,
    }));
  };

  const getModelIcon = (model: Model): string => {
    if (model.id.includes('llama')) return '🦙';
    if (model.id.includes('mistral')) return '🌪️';
    if (model.id.includes('code')) return '💻';
    return '🤖';
  };

  const renderModelCard = (model: Model) => {
    const isSelected = selectedModelId === model.id;
    const isHealthy = healthStatus[model.id] ?? true;

    return (
      <button
        key={model.id}
        onClick={() => handleModelSelect(model.id)}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getModelIcon(model)}</span>
            <div>
              <h4 className="font-semibold text-gray-800">{model.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    model.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {model.status}
                </span>
                {isHealthy && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                    ✓ Healthy
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{model.description}</p>

        <div className="flex flex-wrap gap-2">
          {model.capabilities.slice(0, 3).map((capability: string) => (
            <span
              key={capability}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            >
              {capability}
            </span>
          ))}
          {model.capabilities.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{model.capabilities.length - 3} more
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Model Display */}
      {selectedModel && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">{getModelIcon(selectedModel)}</span>
                <h3 className="text-xl font-bold">{selectedModel.name}</h3>
              </div>
              <p className="text-blue-100 mb-4">{selectedModel.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedModel.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Models</h3>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error.message}
            <button
              type="button"
              onClick={() => fetchModels()}
              className="ml-2 underline font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading models…</div>
        ) : models.length === 0 && !error ? (
          <div className="py-8 text-center text-gray-500">No models found. Pull a model in Ollama first.</div>
        ) : (
          <div className="space-y-3">
            {models.map(renderModelCard)}
          </div>
        )}
      </div>

      {/* Model Metadata */}
      {selectedModel && selectedModel.metadata && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Model Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {selectedModel.metadata.parameters && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Parameters</p>
                <p className="text-sm font-medium text-gray-800">
                  {String(selectedModel.metadata.parameters.size ?? '')}
                </p>
              </div>
            )}

            {selectedModel.metadata.contextWindow && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Context Window</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedModel.metadata.contextWindow.toLocaleString()} tokens
                </p>
              </div>
            )}

            {selectedModel.metadata.supportedFormats && (
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Supported Formats</p>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.metadata.supportedFormats.map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelectorPanel;
