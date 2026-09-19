import { describe, it, expect, vi } from 'vitest';
import ResetPasswordRequest from '../../../../src/api/password/ResetPasswordRequest';
import POSTRequestNoBodyPublic from '../../../../src/api/method/POSTRequestNoBodyPublic';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/method/POSTRequestNoBodyPublic', () => ({
    default: vi.fn(),
}));

describe('ResetPasswordRequest', () => {
    it('should reset password successfully', async () => {
        const mockEmail = 'test@example.com';
        const mockResponse = { success: true };
        vi.mocked(POSTRequestNoBodyPublic).mockResolvedValue(mockResponse);

        const result = await ResetPasswordRequest(mockEmail);

        expect(POSTRequestNoBodyPublic).toHaveBeenCalledWith(`${APP_REQUEST_URL}/account/reset-password/${mockEmail}`);
        expect(result).toEqual({success: true});
    });

    it('should return false and log error when POSTRequestNoBodyPublic fails', async () => {
        const mockEmail = 'test@example.com';
        const mockError = new Error('Reset failed');
        vi.mocked(POSTRequestNoBodyPublic).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await ResetPasswordRequest(mockEmail);
        expect(result).toEqual({success: false, message: 'Reset failed'});
        expect(consoleSpy).toHaveBeenCalledWith('Error resetting password:', mockError);

        consoleSpy.mockRestore();
    });
});
