/**
 * Configuration Store - Zustand
 * US-004
 * Manages server configuration and settings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, ApiConfig } from '@/utils/apiClient';

export interface ServerConfig {
  serverUrl: string;
  apiKey?: string;
  timeout: number;
  maxRetries: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastConnected?: Date;
  responseTime?: number;
  errorMessage?: string;
}

interface ConfigStore {
  config: ServerConfig;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;

  // Actions
  setConfig: (config: Partial<ServerConfig>) => void;
  updateServerUrl: (url: string) => void;
  setApiKey: (apiKey: string) => void;
  testConnection: () => Promise<ConnectionStatus>;
  setLoading: (isLoading: boolean) => void;
  updateConnectionStatus: (status: Partial<ConnectionStatus>) => void;
}

export const createConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
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

      setConfig: (config: Partial<ServerConfig>) => {
        set((state) => ({
          config: { ...state.config, ...config },
        }));
      },

      updateServerUrl: (url: string) => {
        set((state) => ({
          config: { ...state.config, serverUrl: url },
        }));
      },

      setApiKey: (apiKey: string) => {
        set((state) => ({
          config: { ...state.config, apiKey },
        }));
      },

      testConnection: async (): Promise<ConnectionStatus> => {
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
        } catch (error) {
          set((state) => ({
            connectionStatus: {
              isConnected: false,
              lastConnected: new Date(),
              errorMessage: (error as Error).message,
            },
            isLoading: false,
          }));
          return get().connectionStatus;
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      updateConnectionStatus: (status: Partial<ConnectionStatus>) => {
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, ...status },
        }));
      },
    }),
    {
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
    }
  )
);

export const configService = {
  getConfig: () => createConfigStore.getState().config,
  getConnectionStatus: () => createConfigStore.getState().connectionStatus,
  testConnection: createConfigStore.getState().testConnection,
  setConfig: createConfigStore.getState().setConfig,
};

export const useConfigStore = createConfigStore;
export default createConfigStore;
