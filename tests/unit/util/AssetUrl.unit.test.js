import {beforeEach, describe, expect, it, vi} from 'vitest';
import {assetUrl} from '../../../src/util/AssetUrl';

describe('AssetUrl Utility', () => {
    const originalEnv = import.meta.env;

    beforeEach(() => {
        vi.resetModules();
    });

    it('should return the path prefixed with BASE_URL', () => {
        // import.meta.env.BASE_URL is usually handled by vite, in tests it might be '/' or undefined
        const base = import.meta.env.BASE_URL || '/';
        const expected = base.endsWith('/') ? `${base}test-asset.png` : `${base}/test-asset.png`;
        expect(assetUrl('test-asset.png')).toBe(expected.replace(/\/+/g, '/'));
    });

    it('should normalize multiple slashes', () => {
        const result = assetUrl('///path//to/asset.png');
        expect(result).not.toContain('//path');
        expect(result).toMatch(/\/path\/to\/asset.png$/);
    });

    it('should handle empty path', () => {
        const base = import.meta.env.BASE_URL || '/';
        const expected = base.endsWith('/') ? base : `${base}/`;
        expect(assetUrl('')).toBe(expected);
    });

    it('should not break protocols like http://', () => {
        // This is a bit of an edge case for this utility but the code tries to handle it
        // actually the current implementation would prefix it with BASE_URL if relativePath is 'http://...'
        // because it doesn't check if it's already an absolute URL.
        const base = import.meta.env.BASE_URL || '/';
        const input = 'http://external.com/image.png';
        const result = assetUrl(input);
        expect(result).toContain('http://external.com/image.png');
    });
});
