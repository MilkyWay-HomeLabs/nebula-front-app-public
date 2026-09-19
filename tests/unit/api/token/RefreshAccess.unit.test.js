import { describe, it, expect, vi } from 'vitest';
import RefreshAccess from '../../../../src/api/token/RefreshAccess';
import POSTRequestNoBodyPublic from '../../../../src/api/method/POSTRequestNoBodyPublic';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/method/POSTRequestNoBodyPublic', () => ({
    default: vi.fn(),
}));

describe('RefreshAccess', () => {
    it('should refresh via the public endpoint and not persist any token client-side', async () => {
        // Andromeda is cookie-based: the refresh rotates the httpOnly cookie server-side
        // and returns no token in the body, so RefreshAccess must not touch localStorage.
        const mockResponse = { success: true, data: {} };
        vi.mocked(POSTRequestNoBodyPublic).mockResolvedValue(mockResponse);

        const setItemSpy = vi.spyOn(localStorage, 'setItem');

        const result = await RefreshAccess();

        expect(POSTRequestNoBodyPublic).toHaveBeenCalledWith(`${APP_REQUEST_URL}/token/refresh/access`);
        expect(setItemSpy).not.toHaveBeenCalled();
        expect(result).toEqual(mockResponse);

        setItemSpy.mockRestore();
    });

    it('should throw error and log it when POSTRequestNoBodyPublic fails', async () => {
        const mockError = new Error('Refresh failed');
        vi.mocked(POSTRequestNoBodyPublic).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(RefreshAccess()).rejects.toThrow('Refresh failed');
        expect(consoleSpy).toHaveBeenCalledWith('Error refreshing access token:', mockError);

        consoleSpy.mockRestore();
    });
});
