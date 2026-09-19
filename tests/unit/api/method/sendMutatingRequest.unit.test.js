import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ensureCsrfToken before importing the module under test
vi.mock('../../../../src/util/CsrfUtils', () => ({ ensureCsrfToken: vi.fn() }));

import sendMutatingRequest from '../../../../src/api/method/sendMutatingRequest';
import { ensureCsrfToken } from '../../../../src/util/CsrfUtils';

global.fetch = vi.fn();

describe('sendMutatingRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns data when response is ok and json parses', async () => {
        vi.mocked(ensureCsrfToken).mockResolvedValue('token-1');
        const mockData = { id: 1 };
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => mockData });

        const result = await sendMutatingRequest('http://api.test/post', () => ({
            method: 'POST',
            credentials: 'include',
            headers: { get: () => 'token-1' },
            body: JSON.stringify({}),
        }));

        expect(result).toEqual({ success: true, data: mockData });
        expect(ensureCsrfToken).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('logs error and returns failure details for non-CSRF non-ok response', async () => {
        vi.mocked(ensureCsrfToken).mockResolvedValue('token-2');
        const mockErrorText = 'Internal Server Error';
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500, text: async () => mockErrorText });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await sendMutatingRequest('http://api.test/post', () => ({
            method: 'POST',
            credentials: 'include',
            headers: { get: () => 'token-2' },
            body: JSON.stringify({}),
        }));

        expect(result).toEqual({ success: false, status: 500, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('retries once on 403 CSRF error and succeeds on second attempt', async () => {
        // first ensure call returns null (no token), second call returns new token
        vi.mocked(ensureCsrfToken).mockResolvedValueOnce(null).mockResolvedValueOnce('new-token');

        const firstResponse = { ok: false, status: 403, text: async () => 'CSRF token is missing' };
        const secondResponse = { ok: true, json: async () => ({ ok: true }) };
        vi.mocked(fetch).mockResolvedValueOnce(firstResponse).mockResolvedValueOnce(secondResponse);

        const result = await sendMutatingRequest('http://api.test/post', (csrf) => ({
            method: 'POST',
            credentials: 'include',
            headers: { get: () => csrf },
            body: JSON.stringify({}),
        }));

        expect(result).toEqual({ success: true, data: { ok: true } });
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(ensureCsrfToken).toHaveBeenCalledTimes(2);
    });

    it('returns failure when fetch throws', async () => {
        vi.mocked(ensureCsrfToken).mockResolvedValue('token-3');
        const mockError = new Error('Network failure');
        vi.mocked(fetch).mockRejectedValue(mockError);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await sendMutatingRequest('http://api.test/post', () => ({
            method: 'POST',
            credentials: 'include',
            headers: { get: () => 'token-3' },
            body: JSON.stringify({}),
        }));

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});

