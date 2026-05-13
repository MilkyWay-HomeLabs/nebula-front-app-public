import {APP_REQUEST_URL} from '../../data/Credentials';
import {POSTRequest} from "../handler/handlerTokenRefresh";
import UserData from "../../data/UserData";

/**
 * Sends a request to change the user's password.
 * @param {Object} passwordData - The password data (userId, currentPassword, newPassword).
 * @returns {Promise<Object>} The response from the server.
 * @throws {Error} If the request fails or user data is missing.
 */
async function ChangePasswordRequest(passwordData) {
    const url = `${APP_REQUEST_URL}/account/change-password`;
    const userData = UserData.loadUserData();
    
    if (!userData || !userData.email) {
        throw new Error('User email not found. Cannot change password.');
    }

    const payload = createPayload(passwordData, userData.email);
    
    try {
        const response = await POSTRequest(url, payload);
        return response.success === true;
    } catch (error) {
        console.error('Error changing password:', error);
        return false;
    }
}

/**
 * Creates the payload for the change password request.
 * @param {Object} passwordData - The source password data.
 * @param {string} email - The user's email.
 * @returns {Object} The formatted payload.
 */
function createPayload(passwordData, email) {
    return {
        userId: passwordData.userId,
        email: email,
        actualPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
    };
}

export default ChangePasswordRequest;
