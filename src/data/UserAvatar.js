import defaultProfileImage from '../resources/default/profile.png';
import UserData from "./UserData";
import {APP_RESOURCES_DOMAIN} from "./Credentials";

const AVATAR_BASE_URL = `${APP_RESOURCES_DOMAIN}/nebula/avatars`;
const AVATAR_EXTENSION = ".jpg";
const STORAGE_KEY = 'userAvatar';

const getAvatarUrl = (userId) => `${AVATAR_BASE_URL}/${userId}${AVATAR_EXTENSION}`;

const saveBlobToLocalStorage = async (blob, storageKey) => {
    if (!blob || blob.size === 0) {
        throw new Error('Blob is empty or invalid.');
    }
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            if (dataUrl) {
                localStorage.setItem(storageKey, dataUrl);
                resolve(dataUrl);
            } else {
                reject(new Error('Failed to convert blob to Base64.'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading blob using FileReader.'));
        reader.readAsDataURL(blob);
    });
};

const fetchAvatarBlob = async (userId) => {
    const avatarUrl = getAvatarUrl(userId);
    const response = await fetch(avatarUrl, {
        credentials: 'include',
        headers: { 'Accept': 'image/jpeg' }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch avatar: HTTP error ${response.status}`);
    }
    return response.blob();
};

const UserAvatar = {
    updateAvatar: async () => {
        try {
            const userId = UserData.getUserId();
            if (!userId) {
                console.warn('Cannot update avatar: No user ID found.');
                return false;
            }
            return await UserAvatar.fetchAndSaveUserAvatar(userId);
        } catch (error) {
            console.error('An error occurred while updating the avatar:', error);
            return false;
        }
    },

    fetchAndSaveUserAvatar: async (userId) => {
        try {
            if (userId === undefined || userId === null) {
                console.error('Invalid user ID for downloading avatar.');
                return false;
            }
            const blob = await fetchAvatarBlob(userId);
            await saveBlobToLocalStorage(blob, STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('An error occurred while downloading the user avatar:', error);
            localStorage.setItem(STORAGE_KEY, defaultProfileImage);
            return false;
        }
    },

    getUserAvatar: async () => {
        try {
            return localStorage.getItem(STORAGE_KEY) || defaultProfileImage;
        } catch (error) {
            console.error('An error occurred while reading user avatar:', error);
            return defaultProfileImage;
        }
    },
};

export default UserAvatar;
