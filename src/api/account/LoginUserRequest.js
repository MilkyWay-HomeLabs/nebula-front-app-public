import {APP_REQUEST_URL} from '../../data/Credentials';
import POSTRequestPublic from "../method/POSTRequestPublic";

/**
 * Logs in the user and returns tokens.
 * @param {Object} loginData - The user credentials.
 * @returns {Promise<Object>} The server response containing tokens.
 * @throws {Error} If the login fails.
 */
async function LoginUserRequest(loginData) {
    const url = `${APP_REQUEST_URL}/account/token`;
    try {
        return await POSTRequestPublic(url, loginData);
    } catch (error) {
        console.error('Error during login request:', error);
        return null;
    }
}

export default LoginUserRequest;
