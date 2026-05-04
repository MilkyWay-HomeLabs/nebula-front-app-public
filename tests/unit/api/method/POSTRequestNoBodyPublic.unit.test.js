import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSTRequestNoBodyPublic from '../../../../src/api/method/POSTRequestNoBodyPublic';

global.fetch = vi.fn();

describe('POSTRequestNoBodyPublic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { result: 'public success' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await POSTRequestNoBodyPublic('http://api.test/public-action');

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/public-action', expect.objectContaining({
            method: 'POST',
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Service Unavailable';
        const mockResponse = {
            ok: false,
            status: 503,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await POSTRequestNoBodyPublic('http://api.test/public-action');

        expect(result).toEqual({ success: false, status: 503, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
