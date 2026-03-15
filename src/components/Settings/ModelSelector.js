import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Model Selector Component
 * US-005
 * Handles model discovery, selection, and display
 */
import { useEffect, useState } from 'react';
import { useModelStore } from '@/store/modelStore';
export const ModelSelectorPanel = () => {
    const { models, selectedModel, isLoading, error, fetchModels, selectModel, checkModelHealth } = useModelStore();
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [healthStatus, setHealthStatus] = useState({});
    useEffect(() => {
        fetchModels();
    }, [fetchModels]);
    useEffect(() => {
        if (selectedModel) {
            setSelectedModelId(selectedModel.id);
        }
    }, [selectedModel]);
    const handleModelSelect = async (modelId) => {
        await selectModel(modelId);
        setSelectedModelId(modelId);
        const health = await checkModelHealth(modelId);
        setHealthStatus((prev) => ({
            ...prev,
            [modelId]: health.isHealthy,
        }));
    };
    const getModelIcon = (model) => {
        if (model.id.includes('llama'))
            return '🦙';
        if (model.id.includes('mistral'))
            return '🌪️';
        if (model.id.includes('code'))
            return '💻';
        return '🤖';
    };
    const renderModelCard = (model) => {
        const isSelected = selectedModelId === model.id;
        const isHealthy = healthStatus[model.id] ?? true;
        return (_jsxs("button", { onClick: () => handleModelSelect(model.id), className: `w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`, children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-2xl", children: getModelIcon(model) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-800", children: model.name }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${model.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'}`, children: model.status }), isHealthy && (_jsx("span", { className: "px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700", children: "\u2713 Healthy" }))] })] })] }) }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: model.description }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [model.capabilities.slice(0, 3).map((capability) => (_jsx("span", { className: "px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded", children: capability }, capability))), model.capabilities.length > 3 && (_jsxs("span", { className: "px-2 py-1 text-xs text-gray-500", children: ["+", model.capabilities.length - 3, " more"] }))] })] }, model.id));
    };
    return (_jsxs("div", { className: "space-y-6", children: [selectedModel && (_jsx("div", { className: "bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx("span", { className: "text-3xl", children: getModelIcon(selectedModel) }), _jsx("h3", { className: "text-xl font-bold", children: selectedModel.name })] }), _jsx("p", { className: "text-blue-100 mb-4", children: selectedModel.description }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedModel.capabilities.map((capability) => (_jsx("span", { className: "px-3 py-1 bg-white/20 rounded-full text-sm", children: capability }, capability))) })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm", children: "Active" })] }) })] }) })), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Available Models" }), error && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [error.message, _jsx("button", { type: "button", onClick: () => fetchModels(), className: "ml-2 underline font-medium", children: "Retry" })] })), isLoading ? (_jsx("div", { className: "py-8 text-center text-gray-500", children: "Loading models\u2026" })) : models.length === 0 && !error ? (_jsx("div", { className: "py-8 text-center text-gray-500", children: "No models found. Pull a model in Ollama first." })) : (_jsx("div", { className: "space-y-3", children: models.map(renderModelCard) }))] }), selectedModel && selectedModel.metadata && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Model Details" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [selectedModel.metadata.parameters && (_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Parameters" }), _jsx("p", { className: "text-sm font-medium text-gray-800", children: String(selectedModel.metadata.parameters.size ?? '') })] })), selectedModel.metadata.contextWindow && (_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Context Window" }), _jsxs("p", { className: "text-sm font-medium text-gray-800", children: [selectedModel.metadata.contextWindow.toLocaleString(), " tokens"] })] })), selectedModel.metadata.supportedFormats && (_jsxs("div", { className: "col-span-2 p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Supported Formats" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedModel.metadata.supportedFormats.map((format) => (_jsx("span", { className: "px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded", children: format }, format))) })] }))] })] }))] }));
};
export default ModelSelectorPanel;
