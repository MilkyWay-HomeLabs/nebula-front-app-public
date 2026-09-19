import { describe, it, expect, vi, beforeEach } from 'vitest';
import PUTRequest from '../../../../src/api/method/PUTRequest';

global.fetch = vi.fn();

describe('PUTRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { id: 1, name: 'Updated' };
        const body = { name: 'Updated' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await PUTRequest('http://api.test/put', body);

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/put', expect.objectContaining({
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(body),
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Not Found';
        const mockResponse = {
            ok: false,
            status: 404,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await PUTRequest('http://api.test/put', {});

        expect(result).toEqual({ success: false, status: 404, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
