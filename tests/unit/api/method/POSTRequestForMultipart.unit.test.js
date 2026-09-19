import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSTRequestForMultipart from '../../../../src/api/method/POSTRequestForMultipart';

global.fetch = vi.fn();

describe('POSTRequestForMultipart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success and data when response is ok', async () => {
        const mockData = { success: true };
        const formData = new FormData();
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await POSTRequestForMultipart('http://api.test/upload', formData);

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/upload', expect.objectContaining({
            method: 'POST',
            credentials: 'include',
            body: formData,
        }));
        expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return failure details when response is not ok', async () => {
        const mockErrorText = 'Upload Failed';
        const mockResponse = {
            ok: false,
            status: 413,
            text: vi.fn().mockResolvedValue(mockErrorText),
        };
        global.fetch.mockResolvedValue(mockResponse);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await POSTRequestForMultipart('http://api.test/upload', new FormData());

        expect(result).toEqual({ success: false, status: 413, message: mockErrorText });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
