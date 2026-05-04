import { APP_REQUEST_URL } from '../../data/Credentials';
import { GETRequest } from "../handler/handlerTokenRefresh";

/**
 * Fetches the current user's data from the API.
 * @returns {Promise<Object>} The user data object.
 * @throws {Error} If the request fails.
 */
async function UserDataRequest() {
    const url = `${APP_REQUEST_URL}/users`;
    try {
        const response = await GETRequest(url);
        return response.success ? response.data : null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export default UserDataRequest;
