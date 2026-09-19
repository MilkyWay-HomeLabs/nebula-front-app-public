import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageUploadRequest from '../../../../src/api/image/ImageUploadRequest';
import { POST_MULTIPART } from '../../../../src/api/handler/handlerTokenRefresh';
import { APP_REQUEST_URL } from '../../../../src/data/Credentials';

vi.mock('../../../../src/api/handler/handlerTokenRefresh', () => ({
    POST_MULTIPART: vi.fn(),
}));

describe('ImageUploadRequest', () => {
    const mockBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload image successfully', async () => {
        vi.mocked(POST_MULTIPART).mockResolvedValue({ success: true });

        const result = await ImageUploadRequest(mockBase64Image);

        expect(POST_MULTIPART).toHaveBeenCalledWith(
            `${APP_REQUEST_URL}/image`,
            expect.any(FormData)
        );
        expect(result).toEqual({ success: true });

        const formData = vi.mocked(POST_MULTIPART).mock.calls[0][1];
        expect(formData.get('file')).toBeInstanceOf(Blob);
        expect(formData.get('file').type).toBe('image/png');
    });

    it('should return failure object and log error when upload fails', async () => {
        const error = new Error('Upload failed');
        vi.mocked(POST_MULTIPART).mockRejectedValue(error);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await ImageUploadRequest(mockBase64Image);
        expect(result).toEqual({ success: false, message: 'Upload failed' });
        expect(consoleSpy).toHaveBeenCalledWith('Error uploading image:', error);

        consoleSpy.mockRestore();
    });

    it('should handle different image types', async () => {
        const mockJpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
        vi.mocked(POST_MULTIPART).mockResolvedValue({ success: true });

        await ImageUploadRequest(mockJpeg);

        const formData = vi.mocked(POST_MULTIPART).mock.calls[0][1];
        expect(formData.get('file').type).toBe('image/jpeg');
    });
});
