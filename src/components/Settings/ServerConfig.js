import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Server Configuration Component
 * US-004
 * Handles server connection settings and configuration
 */
import { useState, useEffect } from 'react';
import { useConfigStore } from '@/store/configStore';
import { apiClient } from '@/utils/apiClient';
export const ServerConfigPanel = () => {
    const { config, connectionStatus, testConnection, setConfig, updateServerUrl, setApiKey } = useConfigStore();
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
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
        }
        catch (error) {
            setTestResult({
                isConnected: false,
                errorMessage: error.message,
            });
        }
        finally {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Server Configuration" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Server URL" }), _jsx("input", { type: "url", value: serverUrl, onChange: (e) => setServerUrl(e.target.value), placeholder: "http://localhost:11434 (or this app's URL in dev to use proxy)", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "API Key" }), _jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKeyState(e.target.value), placeholder: "Enter API key (optional)", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Timeout (ms)" }), _jsx("input", { type: "number", min: 1000, max: 300000, step: 1000, value: timeoutMs, onChange: (e) => setTimeoutMs(Math.max(1000, Number(e.target.value) || 30000)), placeholder: "30000", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Used for API and streaming requests (1,000\u2013300,000 ms)" })] })] }), _jsxs("div", { className: "mt-6 flex space-x-4", children: [_jsx("button", { onClick: handleTestConnection, disabled: isTesting, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50", children: isTesting ? 'Testing...' : 'Test Connection' }), _jsx("button", { onClick: handleSave, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: "Save Configuration" })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Connection Status" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Connection Status" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}` }), _jsx("span", { className: "text-sm font-medium text-gray-800", children: connectionStatus.isConnected ? 'Connected' : 'Disconnected' })] })] }), connectionStatus.lastConnected && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Last Connected" }), _jsx("span", { className: "text-sm font-medium text-gray-800", children: connectionStatus.lastConnected.toLocaleString() })] })), connectionStatus.responseTime && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Response Time" }), _jsxs("span", { className: "text-sm font-medium text-gray-800", children: [connectionStatus.responseTime, "ms"] })] })), testResult && (_jsx("div", { className: `p-4 rounded-lg ${testResult.isConnected ? 'bg-green-50' : 'bg-red-50'}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("svg", { className: `w-5 h-5 ${testResult.isConnected ? 'text-green-600' : 'text-red-600'}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: testResult.isConnected ? 'M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2h10m-10 2a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-10z' }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-800", children: testResult.isConnected ? 'Connection Successful' : 'Connection Failed' }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: testResult.errorMessage || 'All systems operational' })] })] }) }))] })] })] }));
};
export default ServerConfigPanel;
