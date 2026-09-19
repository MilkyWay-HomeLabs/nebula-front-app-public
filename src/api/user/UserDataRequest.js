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
        if (!response || !response.success) return null;

        // Some backends wrap the actual user data inside an additional "data" field
        // (e.g. { success: true, data: { id: ..., games: [...] } }), while others may
        // directly return the user object. Normalize both shapes here and return the
        // inner user object when necessary.
        const respData = response.data;
        if (respData && typeof respData === 'object') {
            // If the parsed body itself contains a success/data envelope, unwrap it
            if (respData.success === true && respData.data) {
                return respData.data;
            }
            return respData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export default UserDataRequest;
