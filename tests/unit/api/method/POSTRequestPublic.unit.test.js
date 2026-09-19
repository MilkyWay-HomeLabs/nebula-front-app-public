import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSTRequestPublic from '../../../../src/api/method/POSTRequestPublic';

global.fetch = vi.fn();

describe('POSTRequestPublic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { token: 'xyz' };
        const body = { user: 'test' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await POSTRequestPublic('http://api.test/public-post', body);

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/public-post', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(body),
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Conflict';
        const mockResponse = {
            ok: false,
            status: 409,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await POSTRequestPublic('http://api.test/public-post', {});

        expect(result).toEqual({ success: false, status: 409, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
