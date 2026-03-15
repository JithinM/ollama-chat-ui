/**
 * Server Configuration Component
 * US-004
 * Handles server connection settings and configuration
 */

import React, { useState, useEffect } from 'react';
import { useConfigStore, ConnectionStatus } from '@/store/configStore';
import { apiClient } from '@/utils/apiClient';

export const ServerConfigPanel: React.FC = () => {
  const { config, connectionStatus, testConnection, setConfig, updateServerUrl, setApiKey } = useConfigStore();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionStatus | null>(null);

  const [serverUrl, setServerUrl] = useState(config.serverUrl);
  const [apiKey, setApiKeyState] = useState(config.apiKey || '');
  const [timeoutMs, setTimeoutMs] = useState(config.timeout);

  // Sync form inputs when store config changes (e.g. after rehydration)
  useEffect(() => {
    setServerUrl(config.serverUrl);
    setApiKeyState(config.apiKey || '');
    setTimeoutMs(config.timeout);
  }, [config.serverUrl, config.apiKey, config.timeout]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    // Use currently entered URL and timeout (even before Save)
    apiClient.updateConfig({
      baseUrl: serverUrl,
      timeout: timeoutMs,
      ...(apiKey && { apiKey }),
    });
    try {
      const result = await testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        isConnected: false,
        errorMessage: (error as Error).message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const timeout = Math.max(1000, Math.min(300000, timeoutMs)); // clamp 1s–5min
    setConfig({
      serverUrl,
      apiKey: apiKey || undefined,
      timeout,
    });
    updateServerUrl(serverUrl);
    setApiKey(apiKey);
    // Apply saved URL and timeout to API client so all requests use them
    apiClient.updateConfig({
      baseUrl: serverUrl,
      timeout,
      ...(apiKey && { apiKey }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Server URL Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Server Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Server URL
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:11434 (or this app's URL in dev to use proxy)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="Enter API key (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              min={1000}
              max={300000}
              step={1000}
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Math.max(1000, Number(e.target.value) || 30000))}
              placeholder="30000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Used for API and streaming requests (1,000–300,000 ms)</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Status</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Connection Status</span>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-800">
                {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {connectionStatus.lastConnected && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Last Connected</span>
              <span className="text-sm font-medium text-gray-800">
                {connectionStatus.lastConnected.toLocaleString()}
              </span>
            </div>
          )}

          {connectionStatus.responseTime && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-800">
                {connectionStatus.responseTime}ms
              </span>
            </div>
          )}

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.isConnected ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-start space-x-3">
                <svg
                  className={`w-5 h-5 ${
                    testResult.isConnected ? 'text-green-600' : 'text-red-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={testResult.isConnected ? 'M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2h10m-10 2a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-10z'}
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {testResult.isConnected ? 'Connection Successful' : 'Connection Failed'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {testResult.errorMessage || 'All systems operational'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerConfigPanel;
