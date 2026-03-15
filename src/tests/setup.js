/**
 * Test Setup File
 * US-001, US-010
 * Configures testing environment and utilities
 */
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
// Mock IntersectionObserver
class IntersectionObserverMock {
    constructor() {
        Object.defineProperty(this, "observe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "unobserve", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "disconnect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
    }
}
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserverMock,
});
// Mock ResizeObserver
class ResizeObserverMock {
    constructor() {
        Object.defineProperty(this, "observe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "unobserve", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "disconnect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
    }
}
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverMock,
});
// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});
// Mock fetch API
global.fetch = vi.fn();
// Mock console
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
};
console.log = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
console.debug = vi.fn();
// Cleanup after each test
afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
});
// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
