import { describe, it, expect, vi, beforeEach } from 'vitest';
import GETRequestPublic from '../../../../src/api/method/GETRequestPublic';

global.fetch = vi.fn();

describe('GETRequestPublic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { id: 1, name: 'Public Data' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await GETRequestPublic('http://api.test/public');

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/public', {
            method: 'GET',
            headers: expect.any(Headers),
        });
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure, status and message when response is not ok', async () => {
        const mockErrorText = 'Forbidden';
        const mockResponse = {
            ok: false,
            status: 403,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await GETRequestPublic('http://api.test/public');

        expect(result).toEqual({ success: false, status: 403, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
