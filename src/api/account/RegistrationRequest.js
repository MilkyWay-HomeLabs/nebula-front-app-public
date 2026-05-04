import {APP_REQUEST_URL} from '../../data/Credentials';
import POSTRequestPublic from "../method/POSTRequestPublic";

/**
 * Registers a new user.
 * @param {Object} userData - The registration data.
 * @returns {Promise<Object>} The server response.
 * @throws {Error} If the registration fails.
 */
async function RegistrationRequest(userData) {
    const url = `${APP_REQUEST_URL}/account/register`;
    try {
        const response = await POSTRequestPublic(url, userData);
        return response.success === true;
    } catch (error) {
        console.error('Error during registration request:', error);
        return false;
    }
}

export default RegistrationRequest;
