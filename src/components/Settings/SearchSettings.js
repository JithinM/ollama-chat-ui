import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Search Settings Component
 * US-007
 * Web search toggle, provider, depth, and status
 */
import { useState, useEffect } from 'react';
import { useModelStore } from '@/store/modelStore';
const DEFAULT_SEARCH_CONFIG = {
    enabled: false,
    provider: 'google',
    searchDepth: 'standard',
    maxResults: 10,
};
export const SearchSettingsPanel = () => {
    const { selectedModel, setSearchConfig } = useModelStore();
    const [config, setConfig] = useState(DEFAULT_SEARCH_CONFIG);
    const [apiKey, setApiKey] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const currentConfig = selectedModel?.metadata?.searchConfig;
    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
            setApiKey(currentConfig.apiKey ?? '');
        }
        else {
            setConfig(DEFAULT_SEARCH_CONFIG);
            setApiKey('');
        }
    }, [selectedModel?.id]);
    const handleToggle = (enabled) => {
        const next = { ...config, enabled };
        setConfig(next);
        setSearchConfig(next);
        setHasChanges(false);
    };
    const handleProviderChange = (provider) => {
        const next = { ...config, provider };
        setConfig(next);
        setHasChanges(true);
    };
    const handleDepthChange = (depth) => {
        const next = { ...config, searchDepth: depth };
        setConfig(next);
        setHasChanges(true);
    };
    const handleMaxResultsChange = (maxResults) => {
        const next = { ...config, maxResults };
        setConfig(next);
        setHasChanges(true);
    };
    const handleSave = () => {
        setSearchConfig({ ...config, apiKey: apiKey || undefined });
        setHasChanges(false);
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Web Search" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Enable web search to get up-to-date information alongside AI responses." }), !selectedModel && (_jsx("p", { className: "text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-4", children: "Select a model above to configure web search for it." })), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Enable web search" }), _jsx("button", { type: "button", role: "switch", "aria-checked": config.enabled, onClick: () => handleToggle(!config.enabled), className: `relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.enabled ? 'bg-blue-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-1'}` }) })] }), _jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-400'}` }), _jsx("span", { className: "text-sm text-gray-600", children: config.enabled ? 'Search enabled for this model' : 'Search disabled' })] }), config.enabled && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search provider" }), _jsxs("select", { value: config.provider, onChange: (e) => handleProviderChange(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "google", children: "Google" }), _jsx("option", { value: "bing", children: "Bing" }), _jsx("option", { value: "custom", children: "Custom" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search depth" }), _jsxs("select", { value: config.searchDepth, onChange: (e) => handleDepthChange(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "basic", children: "Basic" }), _jsx("option", { value: "standard", children: "Standard" }), _jsx("option", { value: "deep", children: "Deep" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Max results" }), _jsx("input", { type: "number", min: 1, max: 50, value: config.maxResults, onChange: (e) => handleMaxResultsChange(Number(e.target.value) || 10), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "API key (optional)" }), _jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: "For custom or authenticated search", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), hasChanges && (_jsx("button", { onClick: handleSave, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Save search settings" }))] }))] }) }));
};
export default SearchSettingsPanel;
