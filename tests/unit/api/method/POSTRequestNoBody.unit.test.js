import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSTRequestNoBody from '../../../../src/api/method/POSTRequestNoBody';

global.fetch = vi.fn();

describe('POSTRequestNoBody', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { status: 'ok' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await POSTRequestNoBody('http://api.test/action');

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/action', expect.objectContaining({
            method: 'POST',
            credentials: 'include',
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Unauthorized';
        const mockResponse = {
            ok: false,
            status: 401,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await POSTRequestNoBody('http://api.test/action');

        expect(result).toEqual({ success: false, status: 401, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
