import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, fireEvent, createEvent} from '@testing-library/react';
import ImageUploader from '../../../../src/view/component/ImageUploader';
import UserAvatar from '../../../../src/data/UserAvatar';
import {processAndUploadImage} from '../../../../src/util/ImageUploaderUtils';

vi.mock('../../../../src/data/UserAvatar', () => ({
    default: {
        updateAvatar: vi.fn(() => Promise.resolve(true))
    }
}));

vi.mock('../../../../src/util/ImageUploaderUtils', () => ({
    processAndUploadImage: vi.fn()
}));

vi.mock('../../../../src/view/component/AvatarComponent', () => ({
    default: () => <div data-testid="avatar-stub" />
}));

describe('ImageUploader Unit Tests', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test('calls updateAvatar on mount', async () => {
        render(<ImageUploader />);
        expect(UserAvatar.updateAvatar).toHaveBeenCalledTimes(1);
    });

    test('renders avatar component and input field', () => {
        render(<ImageUploader />);
        expect(screen.getByTestId('avatar-stub')).toBeInTheDocument();
        expect(screen.getByTestId('file-input')).toBeInTheDocument();
        expect(screen.getByTestId('upload-label')).toBeInTheDocument();
    });

    test('calls processAndUploadImage when a file is selected', () => {
        render(<ImageUploader />);
        const input = screen.getByTestId('file-input');
        const file = new File(['hello'], 'hello.png', {type: 'image/png'});

        fireEvent.change(input, {target: {files: [file]}});

        expect(processAndUploadImage).toHaveBeenCalledWith(file);
    });

    test('calls processAndUploadImage when a file is dropped', () => {
        render(<ImageUploader />);
        const dropzone = screen.getByTestId('image-uploader-root');
        const file = new File(['hello'], 'hello.png', {type: 'image/png'});

        const dropEvent = {
            dataTransfer: {
                files: [file],
            },
        };

        fireEvent.drop(dropzone, dropEvent);

        expect(processAndUploadImage).toHaveBeenCalledWith(file);
    });

    test('prevents default behavior on dragover', () => {
        render(<ImageUploader />);
        const dropzone = screen.getByTestId('image-uploader-root');
        
        const dragOverEvent = createEvent.dragOver(dropzone);
        fireEvent(dropzone, dragOverEvent);
        
        expect(dragOverEvent.defaultPrevented).toBe(true);
    });
});
