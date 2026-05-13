import {APP_REQUEST_URL} from "../../data/Credentials";
import POSTRequestNoBody from "../method/POSTRequestNoBody";

/**
 * Refreshes the access token.
 * @returns {Promise<Object>} The response from the server.
 * @throws {Error} If the request fails.
 */
async function RefreshAccess() {
    const url = `${APP_REQUEST_URL}/token/refresh/access`;
    try {
        return await POSTRequestNoBody(url);
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}

export default RefreshAccess;
