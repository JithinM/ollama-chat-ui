/**
 * Configuration Store - Zustand
 * US-004
 * Manages server configuration and settings
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/utils/apiClient';
export const createConfigStore = create()(persist((set, get) => ({
    config: {
        serverUrl: 'http://localhost:11434',
        apiKey: '',
        timeout: 30000,
        maxRetries: 3,
    },
    connectionStatus: {
        isConnected: false,
        lastConnected: undefined,
        responseTime: undefined,
        errorMessage: undefined,
    },
    isLoading: false,
    setConfig: (config) => {
        set((state) => ({
            config: { ...state.config, ...config },
        }));
    },
    updateServerUrl: (url) => {
        set((state) => ({
            config: { ...state.config, serverUrl: url },
        }));
    },
    setApiKey: (apiKey) => {
        set((state) => ({
            config: { ...state.config, apiKey },
        }));
    },
    testConnection: async () => {
        set((state) => ({ isLoading: true }));
        try {
            const result = await apiClient.testConnection();
            set((state) => ({
                connectionStatus: {
                    isConnected: result.success,
                    lastConnected: new Date(),
                    responseTime: result.responseTime,
                    errorMessage: result.success ? undefined : result.message,
                },
                isLoading: false,
            }));
            return get().connectionStatus;
        }
        catch (error) {
            set((state) => ({
                connectionStatus: {
                    isConnected: false,
                    lastConnected: new Date(),
                    errorMessage: error.message,
                },
                isLoading: false,
            }));
            return get().connectionStatus;
        }
    },
    setLoading: (isLoading) => {
        set({ isLoading });
    },
    updateConnectionStatus: (status) => {
        set((state) => ({
            connectionStatus: { ...state.connectionStatus, ...status },
        }));
    },
}), {
    name: 'config-storage',
    partialize: (state) => ({
        config: state.config,
        connectionStatus: state.connectionStatus,
    }),
    onRehydrateStorage: () => (state) => {
        if (state?.config) {
            apiClient.updateConfig({
                baseUrl: state.config.serverUrl,
                timeout: state.config.timeout,
                ...(state.config.apiKey && { apiKey: state.config.apiKey }),
            });
        }
    },
}));
export const configService = {
    getConfig: () => createConfigStore.getState().config,
    getConnectionStatus: () => createConfigStore.getState().connectionStatus,
    testConnection: createConfigStore.getState().testConnection,
    setConfig: createConfigStore.getState().setConfig,
};
export const useConfigStore = createConfigStore;
export default createConfigStore;
