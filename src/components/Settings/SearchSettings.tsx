/**
 * Search Settings Component
 * US-007
 * Web search toggle, provider, depth, and status
 */

import React, { useState, useEffect } from 'react';
import { useModelStore } from '@/store/modelStore';
import type { SearchConfig, SearchProvider, SearchDepth } from '@/types';

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  enabled: false,
  provider: 'google',
  searchDepth: 'standard',
  maxResults: 10,
};

export const SearchSettingsPanel: React.FC = () => {
  const { selectedModel, setSearchConfig } = useModelStore();
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_SEARCH_CONFIG);
  const [apiKey, setApiKey] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const currentConfig = selectedModel?.metadata?.searchConfig;

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
      setApiKey(currentConfig.apiKey ?? '');
    } else {
      setConfig(DEFAULT_SEARCH_CONFIG);
      setApiKey('');
    }
  }, [selectedModel?.id]);

  const handleToggle = (enabled: boolean) => {
    const next = { ...config, enabled };
    setConfig(next);
    setSearchConfig(next);
    setHasChanges(false);
  };

  const handleProviderChange = (provider: SearchProvider) => {
    const next = { ...config, provider };
    setConfig(next);
    setHasChanges(true);
  };

  const handleDepthChange = (depth: SearchDepth) => {
    const next = { ...config, searchDepth: depth };
    setConfig(next);
    setHasChanges(true);
  };

  const handleMaxResultsChange = (maxResults: number) => {
    const next = { ...config, maxResults };
    setConfig(next);
    setHasChanges(true);
  };

  const handleSave = () => {
    setSearchConfig({ ...config, apiKey: apiKey || undefined });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Web Search</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enable web search to get up-to-date information alongside AI responses.
        </p>
        {!selectedModel && (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-4">
            Select a model above to configure web search for it.
          </p>
        )}

        {/* Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
          <span className="text-sm font-medium text-gray-700">Enable web search</span>
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={() => handleToggle(!config.enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              config.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                config.enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2 mb-4">
          <div
            className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span className="text-sm text-gray-600">
            {config.enabled ? 'Search enabled for this model' : 'Search disabled'}
          </span>
        </div>

        {config.enabled && (
          <>
            {/* Provider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search provider
              </label>
              <select
                value={config.provider}
                onChange={(e) => handleProviderChange(e.target.value as SearchProvider)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Search depth */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search depth
              </label>
              <select
                value={config.searchDepth}
                onChange={(e) => handleDepthChange(e.target.value as SearchDepth)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="deep">Deep</option>
              </select>
            </div>

            {/* Max results */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max results
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={config.maxResults}
                onChange={(e) => handleMaxResultsChange(Number(e.target.value) || 10)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* API key (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API key (optional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="For custom or authenticated search"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {hasChanges && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save search settings
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchSettingsPanel;
