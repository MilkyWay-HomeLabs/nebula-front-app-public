import { describe, it, expect, vi } from 'vitest';
import UserProfileDataUpdate from '../../../../src/api/user/UserProfileDataUpdate';
import { PATCHRequest } from '../../../../src/api/handler/handlerTokenRefresh';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';
import DateTimeUtils from "../../../../src/util/DateTimeUtils";

vi.mock('../../../../src/api/handler/handlerTokenRefresh', () => ({
    PATCHRequest: vi.fn(),
}));

vi.mock('../../../../src/util/DateTimeUtils', () => ({
    default: {
        transformToTimestamp: vi.fn(),
    },
}));

describe('UserProfileDataUpdate', () => {
    const mockProfileData = {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        nationality: { id: 1 },
        gender: { id: 2 }
    };

    it('should update user profile successfully', async () => {
        const mockTimestamp = 631152000000;
        vi.mocked(DateTimeUtils.transformToTimestamp).mockReturnValue(mockTimestamp);
        vi.mocked(PATCHRequest).mockResolvedValue({ success: true });

        const result = await UserProfileDataUpdate(mockProfileData);

        expect(DateTimeUtils.transformToTimestamp).toHaveBeenCalledWith('1990-01-01');
        expect(PATCHRequest).toHaveBeenCalledWith(
            `${APP_REQUEST_URL}/users/profile`,
            {
                userId: 123,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: mockTimestamp,
                nationalityId: 1,
                genderId: 2
            }
        );
        expect(result).toBe(true);
    });

    it('should handle missing nationality or gender', async () => {
        const minimalProfileData = {
            id: 123,
            firstName: 'John',
            lastName: 'Doe',
            birthDate: '1990-01-01'
        };
        vi.mocked(PATCHRequest).mockResolvedValue({ success: true });

        const result = await UserProfileDataUpdate(minimalProfileData);

        expect(PATCHRequest).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                nationalityId: undefined,
                genderId: undefined
            })
        );
        expect(result).toBe(true);
    });

    it('should return false and log error when PATCHRequest fails', async () => {
        const mockError = new Error('Update Failed');
        vi.mocked(PATCHRequest).mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await UserProfileDataUpdate(mockProfileData);
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Error updating user profile:', mockError);

        consoleSpy.mockRestore();
    });
});
