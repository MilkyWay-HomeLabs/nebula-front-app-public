import { describe, it, expect, vi } from 'vitest';
import RegistrationRequest from '../../../../src/api/account/RegistrationRequest';
import POSTRequestPublic from '../../../../src/api/method/POSTRequestPublic';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/method/POSTRequestPublic', () => ({
    default: vi.fn(),
}));

describe('RegistrationRequest', () => {
    it('should register successfully', async () => {
        const mockUserData = { username: 'newuser', password: 'password123', email: 'test@example.com' };
        const mockResponse = { success: true, userId: 123 };
        vi.mocked(POSTRequestPublic).mockResolvedValue(mockResponse);

        const result = await RegistrationRequest(mockUserData);

        expect(POSTRequestPublic).toHaveBeenCalledWith(`${APP_REQUEST_URL}/account/register`, mockUserData);
        expect(result).toBe(true);
    });

    it('should return false and log error when POSTRequestPublic fails', async () => {
        const mockUserData = { username: 'newuser' };
        const mockError = new Error('Registration failed');
        vi.mocked(POSTRequestPublic).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await RegistrationRequest(mockUserData);
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Error during registration request:', mockError);

        consoleSpy.mockRestore();
    });
});
