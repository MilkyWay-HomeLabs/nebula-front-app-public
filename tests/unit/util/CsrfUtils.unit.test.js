import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCsrfToken, ensureCsrfToken } from '../../../src/util/CsrfUtils';

// Note: in Vitest environment import.meta.env.MODE === 'test', so ensureCsrfToken
// returns early and will not attempt network probes. Tests below assert that
// behavior and validate getCsrfToken parsing.

describe('CsrfUtils', () => {
    beforeEach(() => {
        // clear cookies
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: '',
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        // restore cookie descriptor to empty writable value for next tests
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: '',
        });
    });

    it('getCsrfToken returns token when cookie present', () => {
        document.cookie = 'foo=bar; XSRF-TOKEN=abc123; other=val';
        const token = getCsrfToken();
        expect(token).toBe('abc123');
    });

    it('getCsrfToken returns null when cookie missing', () => {
        document.cookie = 'session=xyz';
        const token = getCsrfToken();
        expect(token).toBeNull();
    });

    it('ensureCsrfToken returns cookie value and does not call fetch in test mode', async () => {
        // set cookie
        document.cookie = 'XSRF-TOKEN=test-token-1';

        // spy on global.fetch
        const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(new Response(null, {status: 200})));

        const token = await ensureCsrfToken();
        expect(token).toBe('test-token-1');
        // ensure no network probes were executed in test mode
        expect(fetchSpy).not.toHaveBeenCalled();

        fetchSpy.mockRestore();
    });

    it('ensureCsrfToken returns null and does not call fetch when cookie missing in test mode', async () => {
        // no cookie set
        document.cookie = '';

        const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(new Response(null, {status: 200})));

        const token = await ensureCsrfToken();
        expect(token).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();

        fetchSpy.mockRestore();
    });
});

