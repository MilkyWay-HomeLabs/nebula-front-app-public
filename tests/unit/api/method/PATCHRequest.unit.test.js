import { describe, it, expect, vi, beforeEach } from 'vitest';
import PATCHRequest from '../../../../src/api/method/PATCHRequest';

global.fetch = vi.fn();

describe('PATCHRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { updated: true };
        const body = { name: 'New Name' };
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await PATCHRequest('http://api.test/update', body);

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/update', expect.objectContaining({
            method: 'PATCH',
            credentials: 'include',
            body: JSON.stringify(body),
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Bad Request';
        const mockResponse = {
            ok: false,
            status: 400,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await PATCHRequest('http://api.test/update', {});

        expect(result).toEqual({ success: false, status: 400, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
