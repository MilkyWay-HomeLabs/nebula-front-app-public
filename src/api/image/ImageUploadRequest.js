import {POST_MULTIPART} from "../handler/handlerTokenRefresh";
import {APP_REQUEST_URL} from '../../data/Credentials';

/**
 * Uploads an image to the server.
 * @param {string} imageBase64 - The image data in Base64 format.
 * @returns {Promise<Object>} The server response.
 * @throws {Error} If the upload fails.
 */
async function ImageUploadRequest(imageBase64) {
    const url = `${APP_REQUEST_URL}/image`;
    try {
        const formData = createFormDataFromBase64(imageBase64);
        return await POST_MULTIPART(url, formData);
    } catch (error) {
        console.error('Error uploading image:', error);
        return {success: false, message: error.message};
    }
}

/**
 * Creates FormData from a Base64 image string.
 * @param {string} base64String - The Base64 string.
 * @returns {FormData} The created FormData.
 */
function createFormDataFromBase64(base64String) {
    const [header, data] = base64String.split(',');
    const mimeTypeMatch = header.match(/data:(image\/[a-zA-Z]+);base64/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const extension = mimeType.split('/')[1];

    const binaryData = atob(data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
    }

    const formData = new FormData();
    const blob = new Blob([arrayBuffer], {type: mimeType});
    formData.append('file', blob, `upload.${extension}`);
    return formData;
}

export default ImageUploadRequest;
