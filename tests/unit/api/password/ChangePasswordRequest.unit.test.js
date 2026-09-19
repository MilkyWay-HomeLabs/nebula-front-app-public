import { describe, it, expect, vi } from 'vitest';
import ChangePasswordRequest from '../../../../src/api/password/ChangePasswordRequest';
import { POSTRequest } from '../../../../src/api/handler/handlerTokenRefresh';
import UserData from '../../../../src/data/UserData';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/handler/handlerTokenRefresh', () => ({
    POSTRequest: vi.fn(),
}));

vi.mock('../../../../src/data/UserData', () => ({
    default: {
        loadUserData: vi.fn(),
    },
}));

describe('ChangePasswordRequest', () => {
    const mockPasswordData = {
        userId: 1,
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123'
    };

    it('should change password successfully', async () => {
        const mockUserData = { email: 'test@example.com' };
        vi.mocked(UserData.loadUserData).mockReturnValue(mockUserData);
        
        const mockResponse = { success: true };
        vi.mocked(POSTRequest).mockResolvedValue(mockResponse);

        const result = await ChangePasswordRequest(mockPasswordData);

        expect(UserData.loadUserData).toHaveBeenCalled();
        expect(POSTRequest).toHaveBeenCalledWith(
            `${APP_REQUEST_URL}/account/change-password`,
            {
                userId: 1,
                email: 'test@example.com',
                actualPassword: 'oldPassword123',
                newPassword: 'newPassword123'
            }
        );
        expect(result).toBe(true);
    });

    it('should throw error when user data is missing', async () => {
        vi.mocked(UserData.loadUserData).mockReturnValue(null);

        await expect(ChangePasswordRequest(mockPasswordData)).rejects.toThrow('User email not found. Cannot change password.');
    });

    it('should throw error when user email is missing', async () => {
        vi.mocked(UserData.loadUserData).mockReturnValue({ id: 1 });

        await expect(ChangePasswordRequest(mockPasswordData)).rejects.toThrow('User email not found. Cannot change password.');
    });

    it('should return false and log error when POSTRequest fails', async () => {
        const mockUserData = { email: 'test@example.com' };
        vi.mocked(UserData.loadUserData).mockReturnValue(mockUserData);
        
        const mockError = new Error('API Error');
        vi.mocked(POSTRequest).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await ChangePasswordRequest(mockPasswordData);
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Error changing password:', mockError);

        consoleSpy.mockRestore();
    });
});
