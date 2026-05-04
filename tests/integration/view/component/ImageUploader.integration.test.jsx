import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, fireEvent, waitFor} from '@testing-library/react';
import ImageUploader from '../../../../src/view/component/ImageUploader';
import UserAvatar from '../../../../src/data/UserAvatar';
import avatarListenerSingletonInstance from '../../../../src/singles/AvatarListenerSingleton';

// Mocking the whole chain
vi.mock('../../../../src/data/UserData', () => ({
    default: {
        getUserId: vi.fn(() => 'user-123'),
        getThemeName: vi.fn(() => Promise.resolve('Default')),
    }
}));

// We want to test how it interacts with real utils but mock the API and Avatar updates
vi.mock('../../../../src/api/image/ImageUploadRequest', () => ({
    default: vi.fn(() => Promise.resolve({success: true}))
}));

// Mock processAndUploadImage to avoid jsdom FileReader issues with Blobs
vi.mock('../../../../src/util/ImageUploaderUtils', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        processAndUploadImage: vi.fn(async () => {
            const updateSuccess = await UserAvatar.updateAvatar();
            if (updateSuccess) {
                avatarListenerSingletonInstance.notifyObservers();
            }
        })
    };
});

// Mock window.fetch for UserAvatar.updateAvatar (which calls fetchAndSaveAvatarData)
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['fake-image-data'], {type: 'image/jpeg'})),
    })
);

describe('ImageUploader Integration Tests', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        localStorage.clear();
    });

    test('full flow: selecting a file uploads it, updates avatar and notifies observers', async () => {
        const updateAvatarSpy = vi.spyOn(UserAvatar, 'updateAvatar').mockResolvedValue(true);
        const notifySpy = vi.spyOn(avatarListenerSingletonInstance, 'notifyObservers');
        
        render(<ImageUploader />);

        const input = screen.getByTestId('file-input');
        const file = new File(['fake-content'], 'test.png', { type: 'image/png' });

        // Simulate file selection
        fireEvent.change(input, { target: { files: [file] } });

        // Wait for the async process to complete
        await waitFor(() => {
            expect(updateAvatarSpy).toHaveBeenCalled();
        }, { timeout: 2000 });

        await waitFor(() => {
            expect(notifySpy).toHaveBeenCalled();
        }, { timeout: 2000 });
    });

    test('drag and drop flow: dropping a file uploads it and updates avatar', async () => {
        const updateAvatarSpy = vi.spyOn(UserAvatar, 'updateAvatar').mockResolvedValue(true);
        
        render(<ImageUploader />);

        const dropzone = screen.getByTestId('image-uploader-root');
        const file = new File(['fake-content'], 'test.png', { type: 'image/png' });

        fireEvent.drop(dropzone, {
            dataTransfer: {
                files: [file]
            }
        });

        await waitFor(() => {
            expect(updateAvatarSpy).toHaveBeenCalled();
        }, { timeout: 2000 });
    });
});
