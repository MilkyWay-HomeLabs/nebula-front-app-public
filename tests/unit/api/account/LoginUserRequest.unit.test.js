import { describe, it, expect, vi } from 'vitest';
import LoginUserRequest from '../../../../src/api/account/LoginUserRequest';
import POSTRequestPublic from '../../../../src/api/method/POSTRequestPublic';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/method/POSTRequestPublic', () => ({
    default: vi.fn(),
}));

describe('LoginUserRequest', () => {
    it('should login successfully', async () => {
        const mockLoginData = { username: 'user', password: 'pass' };
        const mockData = { token: 'abc' };
        const mockResponse = { success: true, data: mockData };
        vi.mocked(POSTRequestPublic).mockResolvedValue(mockResponse);

        const result = await LoginUserRequest(mockLoginData);

        expect(POSTRequestPublic).toHaveBeenCalledWith(`${APP_REQUEST_URL}/account/token`, mockLoginData);
        expect(result.data).toEqual(mockData);
    });

    it('should return null and log error when POSTRequestPublic fails', async () => {
        const mockLoginData = { username: 'user', password: 'wrong' };
        const mockError = new Error('Unauthorized');
        vi.mocked(POSTRequestPublic).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await LoginUserRequest(mockLoginData);
        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Error during login request:', mockError);

        consoleSpy.mockRestore();
    });
});
