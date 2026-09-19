import { describe, it, expect, vi, beforeEach } from 'vitest';
import PATCHRequestPublic from '../../../../src/api/method/PATCHRequestPublic';
import { APP_USERNAME, APP_PASSWORD } from '../../../../src/data/Credentials';

// Mock global fetch
global.fetch = vi.fn();

describe('PATCHRequestPublic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should send a PATCH request successfully and return data', async () => {
        const mockData = { id: 1, name: 'Updated Name' };
        const mockResponse = {
            ok: true,
            json: async () => mockData,
        };
        vi.mocked(fetch).mockResolvedValue(mockResponse);

        const url = 'https://api.example.com/update';
        const bodyData = { name: 'Updated Name' };
        const result = await PATCHRequestPublic(url, bodyData);

        expect(fetch).toHaveBeenCalledWith(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: expect.any(Headers),
            body: JSON.stringify(bodyData),
        });

        const headers = vi.mocked(fetch).mock.calls[0][1].headers;
        expect(headers.get('Content-Type')).toBe('application/json');
        expect(headers.get('Authorization')).toBe('Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should handle non-ok response and return error status and message', async () => {
        const mockErrorText = 'Bad Request';
        const mockResponse = {
            ok: false,
            status: 400,
            text: async () => mockErrorText,
        };
        vi.mocked(fetch).mockResolvedValue(mockResponse);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        const url = 'https://api.example.com/update';
        const bodyData = { name: 'Invalid' };
        const result = await PATCHRequestPublic(url, bodyData);

        expect(result).toEqual({ success: false, status: 400, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalledWith(`Error: 400 - ${mockErrorText}`);
        
        consoleSpy.mockRestore();
    });

    it('should handle network error or other exceptions', async () => {
        const mockError = new Error('Network failure');
        vi.mocked(fetch).mockRejectedValue(mockError);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const url = 'https://api.example.com/update';
        const bodyData = { name: 'Retry' };
        const result = await PATCHRequestPublic(url, bodyData);

        expect(result).toEqual({ success: false, message: mockError.message });
        expect(consoleSpy).toHaveBeenCalledWith('Error sending request:', mockError);

        consoleSpy.mockRestore();
    });
});
