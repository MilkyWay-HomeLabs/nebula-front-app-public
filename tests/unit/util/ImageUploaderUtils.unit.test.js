import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileAsDataURL, uploadImageRequest, notifyObserversWithDelay, processAndUploadImage } from '../../../src/util/ImageUploaderUtils';
import ImageUploadRequest from '../../../src/api/image/ImageUploadRequest';
import avatarListenerSingletonInstance from '../../../src/singles/AvatarListenerSingleton';
import UserAvatar from '../../../src/data/UserAvatar';

vi.mock('../../../src/api/image/ImageUploadRequest');
vi.mock('../../../src/singles/AvatarListenerSingleton', () => ({
    default: {
        notifyObservers: vi.fn()
    }
}));
vi.mock('../../../src/data/UserAvatar', () => ({
    default: {
        updateAvatar: vi.fn()
    }
}));

describe('ImageUploaderUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('readFileAsDataURL', () => {
        it('should read a Blob/File as DataURL', async () => {
            const blob = new Blob(['test'], { type: 'text/plain' });
            const result = await readFileAsDataURL(blob);
            expect(result).toContain('data:text/plain;base64,');
        });

        it('should reject if input is not a Blob or File', async () => {
            await expect(readFileAsDataURL('not-a-file')).rejects.toBe('Invalid file type. Expected File or Blob.');
        });
    });

    describe('uploadImageRequest', () => {
        it('should return true if API request succeeds', async () => {
            vi.mocked(ImageUploadRequest).mockResolvedValue({ success: true });
            const result = await uploadImageRequest('data:image/png;base64,xxx');
            expect(result).toBe(true);
        });

        it('should return false if API request fails', async () => {
            vi.mocked(ImageUploadRequest).mockResolvedValue({ success: false, message: 'Network error' });
            const result = await uploadImageRequest('data:image/png;base64,xxx');
            expect(result).toBe(false);
        });
    });

    describe('notifyObserversWithDelay', () => {
        it('should call notifyObservers after delay', async () => {
            vi.useFakeTimers();
            notifyObserversWithDelay(100);
            expect(avatarListenerSingletonInstance.notifyObservers).not.toHaveBeenCalled();
            vi.advanceTimersByTime(100);
            expect(avatarListenerSingletonInstance.notifyObservers).toHaveBeenCalled();
            vi.useRealTimers();
        });
    });

    describe('processAndUploadImage', () => {
        it('should complete full flow successfully', async () => {
            const blob = new Blob(['test'], { type: 'image/png' });
            vi.mocked(ImageUploadRequest).mockResolvedValue({ success: true });
            vi.mocked(UserAvatar.updateAvatar).mockResolvedValue(true);
            
            // Do NOT use fake timers for the whole test if it involves promises that need to resolve
            await processAndUploadImage(blob);

            expect(ImageUploadRequest).toHaveBeenCalled();
            expect(UserAvatar.updateAvatar).toHaveBeenCalled();
        });

        it('should log error if upload fails', async () => {
            const blob = new Blob(['test'], { type: 'image/png' });
            vi.mocked(ImageUploadRequest).mockResolvedValue({ success: false });
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await processAndUploadImage(blob);

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('Image upload failed'));
            spy.mockRestore();
        });
    });
});
