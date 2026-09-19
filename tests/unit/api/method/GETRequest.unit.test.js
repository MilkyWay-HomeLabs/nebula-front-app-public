import {beforeEach, describe, expect, it, vi} from 'vitest';
import GETRequest from '../../../../src/api/method/GETRequest';

global.fetch = vi.fn();

describe('GETRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should send Basic app credentials and rely on httpOnly cookies (never Bearer)', async () => {
        // Even if a stale token lingers in localStorage, the cookie-based model must
        // not send it as a Bearer header — user auth rides the httpOnly cookie.
        localStorage.setItem('authToken', 'stale-token');
        const mockData = { id: 1 };
        global.fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        });

        await GETRequest('http://api.test/data');

        const options = global.fetch.mock.calls[0][1];
        expect(options.credentials).toBe('include');
        expect(options.headers.get('Authorization')).toMatch(/^Basic /);
        expect(options.headers.get('Authorization')).not.toMatch(/^Bearer /);
    });

    it('should return success and data when response is ok', async () => {
        const mockData = {id: 1, name: 'Test'};
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await GETRequest('http://api.test/data');

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/data', {
            method: 'GET',
            credentials: 'include',
            headers: expect.any(Headers),
        });
        expect(result).toEqual({success: true, data: mockData});
    });

    it('should return failure, status and message when response is not ok', async () => {
        const mockErrorText = 'Not Found';
        const mockResponse = {
            ok: false,
            status: 404,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        });

        const result = await GETRequest('http://api.test/data');

        expect(result).toEqual({success: false, status: 404, message: mockErrorText});
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should return failure and error message when fetch throws', async () => {
        const mockError = new Error('Network Error');
        global.fetch.mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        });

        const result = await GETRequest('http://api.test/data');

        expect(result).toEqual({success: false, message: mockError.message});
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
