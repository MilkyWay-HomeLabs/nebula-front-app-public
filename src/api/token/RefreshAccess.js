import {APP_REQUEST_URL} from "../../data/Credentials";
import POSTRequestNoBodyPublic from "../method/POSTRequestNoBodyPublic";

/**
 * Refreshes the access token.
 *
 * Andromeda is cookie-based (httpOnly): the refresh endpoint does not return an
 * access token in the response body — it rotates the httpOnly access cookie
 * server-side. The browser sends the refresh cookie automatically because the
 * underlying request uses `credentials: 'include'`, and picks up the rotated
 * cookie from the response. There is therefore nothing to persist client-side.
 *
 * @returns {Promise<Object>} The response from the server.
 * @throws {Error} If the request fails.
 */
async function RefreshAccess() {
    const url = `${APP_REQUEST_URL}/token/refresh/access`;
    try {
        return await POSTRequestNoBodyPublic(url);
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}

export default RefreshAccess;
