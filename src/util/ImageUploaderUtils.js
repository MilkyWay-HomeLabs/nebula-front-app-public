import ImageUploadRequest from "../api/image/ImageUploadRequest";
import avatarListenerSingletonInstance from "../singles/AvatarListenerSingleton";
import UserAvatar from "../data/UserAvatar";

/**
 * Reads a file and converts it to a DataURL string using FileReader.
 *
 * @param {File} file - The file to be read.
 * @returns {Promise<string>} - A promise resolving to the DataURL of the file.
 */
export const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        if (!(file instanceof File) && !(file instanceof Blob)) {
            reject("Invalid file type. Expected File or Blob.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("Failed to read file as DataURL.");
        reader.readAsDataURL(file);
    });
};

/**
 * Sends a request to upload the image data URL.
 *
 * @param {string} imageDataUrl - The DataURL of the image to upload.
 * @returns {Promise<boolean>} - A promise resolving to true if upload was successful, false otherwise.
 */
export const uploadImageRequest = async (imageDataUrl) => {
    try {
        const response = await ImageUploadRequest(imageDataUrl);
        return response.success;
    } catch (error) {
        console.error("[ImageUploaderUtils] Error during image upload request:", error);
        return false;
    }
};

/**
 * Notifies avatar observers after a specified delay to allow state synchronization.
 *
 * @param {number} delay - The delay in milliseconds.
 */
export const notifyObserversWithDelay = (delay) => {
    setTimeout(() => {
        avatarListenerSingletonInstance.notifyObservers();
    }, delay);
};

/**
 * Orchestrates the full process of reading, uploading, and updating the user's avatar.
 * Notifies observers if the update is successful.
 *
 * @param {File} file - The image file to process.
 * @returns {Promise<void>}
 */
export const processAndUploadImage = async (file) => {
    try {
        const imageDataUrl = await readFileAsDataURL(file);
        const uploadSuccess = await uploadImageRequest(imageDataUrl);

        if (uploadSuccess) {
            const updateSuccess = await UserAvatar.updateAvatar();
            if (updateSuccess) {
                notifyObserversWithDelay(100);
            } else {
                console.error("[ImageUploaderUtils] Avatar update failed after successful upload.");
            }
        } else {
            console.error("[ImageUploaderUtils] Image upload failed.");
        }
    } catch (error) {
        console.error("[ImageUploaderUtils] Error during image processing:", error);
    }
};
