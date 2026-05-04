import { describe, it, expect, vi } from 'vitest';
import RefreshAccess from '../../../../src/api/token/RefreshAccess';
import POSTRequestNoBody from '../../../../src/api/method/POSTRequestNoBody';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/method/POSTRequestNoBody', () => ({
    default: vi.fn(),
}));

describe('RefreshAccess', () => {
    it('should refresh access token successfully', async () => {
        const mockResponse = { success: true };
        vi.mocked(POSTRequestNoBody).mockResolvedValue(mockResponse);

        const result = await RefreshAccess();

        expect(POSTRequestNoBody).toHaveBeenCalledWith(`${APP_REQUEST_URL}/token/refresh/access`);
        expect(result).toEqual(mockResponse);
    });

    it('should throw error and log it when POSTRequestNoBody fails', async () => {
        const mockError = new Error('Refresh failed');
        vi.mocked(POSTRequestNoBody).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(RefreshAccess()).rejects.toThrow('Refresh failed');
        expect(consoleSpy).toHaveBeenCalledWith('Error refreshing access token:', mockError);

        consoleSpy.mockRestore();
    });
});
