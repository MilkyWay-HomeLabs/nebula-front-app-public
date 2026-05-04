import { describe, it, expect, vi } from 'vitest';
import ConfirmationTokenRequest from '../../../../src/api/account/ConfirmationTokenRequest';
import PATCHRequestPublic from '../../../../src/api/method/PATCHRequestPublic';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/method/PATCHRequestPublic', () => ({
    default: vi.fn(),
}));

describe('ConfirmationTokenRequest', () => {
    it('should confirm token successfully', async () => {
        const mockTokenData = { token: 'valid-token' };
        const mockResponse = { success: true };
        vi.mocked(PATCHRequestPublic).mockResolvedValue(mockResponse);

        const result = await ConfirmationTokenRequest(mockTokenData);

        expect(PATCHRequestPublic).toHaveBeenCalledWith(`${APP_REQUEST_URL}/account/confirm`, mockTokenData);
        expect(result).toEqual({success: true});
    });

    it('should return false and log error when PATCHRequestPublic fails', async () => {
        const mockTokenData = { token: 'invalid-token' };
        const mockError = new Error('Invalid Token');
        vi.mocked(PATCHRequestPublic).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await ConfirmationTokenRequest(mockTokenData);
        expect(result).toEqual({success: false, message: 'Invalid Token'});
        expect(consoleSpy).toHaveBeenCalledWith('Error confirming account token:', mockError);

        consoleSpy.mockRestore();
    });
});
