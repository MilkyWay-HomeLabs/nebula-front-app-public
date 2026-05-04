import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSTRequest from '../../../../src/api/method/POSTRequest';

global.fetch = vi.fn();

describe('POSTRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should use Bearer token when available in localStorage', async () => {
        const mockToken = 'test-token';
        localStorage.setItem('authToken', mockToken);
        const mockData = { id: 1 };
        global.fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        });

        await POSTRequest('http://api.test/post', { key: 'value' });

        const headers = global.fetch.mock.calls[0][1].headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { id: 123 };
        const body = { key: 'value' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await POSTRequest('http://api.test/post', body);

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/post', expect.objectContaining({
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(body),
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Internal Server Error';
        const mockResponse = {
            ok: false,
            status: 500,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await POSTRequest('http://api.test/post', {});

        expect(result).toEqual({ success: false, status: 500, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
