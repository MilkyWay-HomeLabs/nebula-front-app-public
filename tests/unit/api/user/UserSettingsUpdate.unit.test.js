import { describe, it, expect, vi } from 'vitest';
import UserSettingsUpdate from '../../../../src/api/user/UserSettingsUpdate';
import { PUTRequest } from '../../../../src/api/handler/handlerTokenRefresh';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/handler/handlerTokenRefresh', () => ({
    PUTRequest: vi.fn(),
}));

describe('UserSettingsUpdate', () => {
    const mockGeneralSettings = {
        userId: 1,
        theme: { id: 10, name: 'Dark' }
    };

    const mockSoundSettings = {
        userId: 1,
        muted: false,
        battleCry: true,
        volumeMaster: 80,
        volumeMusic: 50,
        volumeEffects: 70,
        volumeVoices: 90
    };

    it('should update user settings successfully', async () => {
        vi.mocked(PUTRequest).mockResolvedValue({ success: true });

        const result = await UserSettingsUpdate(mockGeneralSettings, mockSoundSettings);

        expect(PUTRequest).toHaveBeenCalledWith(
            `${APP_REQUEST_URL}/users/settings`,
            {
                userId: 1,
                general: {
                    userId: 1,
                    theme: { id: 10, name: 'Dark' }
                },
                sound: {
                    userId: 1,
                    muted: false,
                    battleCry: true,
                    volumeMaster: 80,
                    volumeMusic: 50,
                    volumeEffects: 70,
                    volumeVoices: 90
                }
            }
        );
        expect(result).toBe(true);
    });

    it('should handle missing theme in general settings', async () => {
        const incompleteGeneral = { userId: 1 };
        vi.mocked(PUTRequest).mockResolvedValue({ success: true });

        const result = await UserSettingsUpdate(incompleteGeneral, mockSoundSettings);

        expect(PUTRequest).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                general: {
                    userId: 1,
                    theme: { id: undefined, name: undefined }
                }
            })
        );
        expect(result).toBe(true);
    });

    it('should return false and log error when PUTRequest fails', async () => {
        const mockError = new Error('Update Failed');
        vi.mocked(PUTRequest).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await UserSettingsUpdate(mockGeneralSettings, mockSoundSettings);
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Error updating user settings:', mockError);

        consoleSpy.mockRestore();
    });
});
