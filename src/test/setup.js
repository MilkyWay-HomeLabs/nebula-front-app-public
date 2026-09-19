import {expect} from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

/**
 * Web Storage polyfill for the test environment.
 *
 * The bundled jsdom build does not expose the Web Storage API (`localStorage` /
 * `sessionStorage` are `undefined`), so any code that persists tokens or user data
 * would throw in tests. We install a minimal in-memory `Storage` implementation on
 * both `globalThis` and `window` when it is missing, so production code paths that
 * read/write storage behave the same under test.
 */
class MemoryStorage {
    constructor() {
        this._data = new Map();
    }

    get length() {
        return this._data.size;
    }

    key(index) {
        return Array.from(this._data.keys())[index] ?? null;
    }

    getItem(key) {
        return this._data.has(String(key)) ? this._data.get(String(key)) : null;
    }

    setItem(key, value) {
        this._data.set(String(key), String(value));
    }

    removeItem(key) {
        this._data.delete(String(key));
    }

    clear() {
        this._data.clear();
    }
}

// Expose the polyfill as the global `Storage` constructor so tests that spy on
// `Storage.prototype.setItem` observe calls made through `localStorage`.
Object.defineProperty(globalThis, 'Storage', {configurable: true, value: MemoryStorage});

const installStorage = (name) => {
    if (typeof globalThis[name] !== 'undefined') return;
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, name, {configurable: true, value: storage});
    if (typeof window !== 'undefined' && typeof window[name] === 'undefined') {
        Object.defineProperty(window, name, {configurable: true, value: storage});
    }
};

installStorage('localStorage');
installStorage('sessionStorage');
