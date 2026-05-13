import { describe, it, expect, vi } from 'vitest';
import UserDataRequest from '../../../../src/api/user/UserDataRequest';
import { GETRequest } from '../../../../src/api/handler/handlerTokenRefresh';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/handler/handlerTokenRefresh', () => ({
    GETRequest: vi.fn(),
}));

describe('UserDataRequest', () => {
    it('should fetch user data successfully', async () => {
        const mockUserData = { id: 1, username: 'testuser' };
        vi.mocked(GETRequest).mockResolvedValue({ success: true, data: mockUserData });

        const result = await UserDataRequest();

        expect(GETRequest).toHaveBeenCalledWith(`${APP_REQUEST_URL}/users`);
        expect(result).toEqual(mockUserData);
    });

    it('should return null and log error when GETRequest fails', async () => {
        const mockError = new Error('Network Error');
        vi.mocked(GETRequest).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await UserDataRequest();
        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching user data:', mockError);

        consoleSpy.mockRestore();
    });
});
