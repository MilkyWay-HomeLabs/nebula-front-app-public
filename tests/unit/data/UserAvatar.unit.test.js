import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UserAvatar from '../../../src/data/UserAvatar';
import UserData from '../../../src/data/UserData';
import defaultProfileImage from '../../../src/resources/default/profile.png';

vi.mock('../../../src/data/UserData');

describe('UserAvatar', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        global.fetch = vi.fn();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('updateAvatar', () => {
        it('should return false if no userId found', async () => {
            vi.mocked(UserData.getUserId).mockReturnValue(null);
            const result = await UserAvatar.updateAvatar();
            expect(result).toBe(false);
            expect(console.warn).toHaveBeenCalled();
        });

        it('should call fetchAndSaveUserAvatar if userId exists', async () => {
            vi.mocked(UserData.getUserId).mockReturnValue(123);
            const spy = vi.spyOn(UserAvatar, 'fetchAndSaveUserAvatar').mockResolvedValue(true);
            
            const result = await UserAvatar.updateAvatar();
            
            expect(result).toBe(true);
            expect(spy).toHaveBeenCalledWith(123);
        });
    });

    describe('fetchAndSaveUserAvatar', () => {
        it('should return false for invalid userId', async () => {
            const result = await UserAvatar.fetchAndSaveUserAvatar(null);
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalled();
        });

        it('should fetch avatar and save to localStorage', async () => {
            const mockDataUrl = 'data:image/jpeg;base64,YXZhdGFyIGRhdGE=';
            
            const blob = {
                size: 10,
                type: 'image/jpeg'
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                blob: () => Promise.resolve(blob)
            });

            // Mock FileReader
            const FileReaderMock = vi.fn(function() {
                this.readAsDataURL = vi.fn(() => {
                    this.result = mockDataUrl;
                    if (this.onloadend) this.onloadend();
                });
            });
            vi.stubGlobal('FileReader', FileReaderMock);

            const result = await UserAvatar.fetchAndSaveUserAvatar(123);

            expect(result).toBe(true);
            expect(localStorage.getItem('userAvatar')).toBe(mockDataUrl);
        });

        it('should set default image on fetch failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
            
            const result = await UserAvatar.fetchAndSaveUserAvatar(123);
            
            expect(result).toBe(false);
            expect(localStorage.getItem('userAvatar')).toBe(defaultProfileImage);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getUserAvatar', () => {
        it('should return saved avatar from localStorage', async () => {
            localStorage.setItem('userAvatar', 'saved-avatar-url');
            const result = await UserAvatar.getUserAvatar();
            expect(result).toBe('saved-avatar-url');
        });

        it('should return default image if nothing saved', async () => {
            const result = await UserAvatar.getUserAvatar();
            expect(result).toBe(defaultProfileImage);
        });
    });
});
