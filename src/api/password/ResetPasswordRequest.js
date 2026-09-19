import {APP_REQUEST_URL} from '../../data/Credentials';
import POSTRequestNoBodyPublic from "../method/POSTRequestNoBodyPublic";

/**
 * Sends a request to reset the password for the given email.
 * @param {string} email - The email address.
 * @returns {Promise<Object>} The response from the server.
 * @throws {Error} If the request fails.
 */
async function ResetPasswordRequest(email) {
    const url = `${APP_REQUEST_URL}/account/reset-password/${email}`;
    try {
        return await POSTRequestNoBodyPublic(url);
    } catch (error) {
        console.error('Error resetting password:', error);
        return {success: false, message: error.message};
    }
}

export default ResetPasswordRequest;
