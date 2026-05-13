import {APP_REQUEST_URL} from '../../data/Credentials';
import PATCHRequestPublic from "../method/PATCHRequestPublic";

/**
 * Confirms the user's account using a token.
 * @param {Object} tokenData - The token data.
 * @returns {Promise<Object>} The server response.
 * @throws {Error} If the request fails.
 */
async function ConfirmationTokenRequest(tokenData) {
    const url = `${APP_REQUEST_URL}/account/confirm`;
    try {
        return await PATCHRequestPublic(url, tokenData);
    } catch (error) {
        console.error('Error confirming account token:', error);
        return {success: false, message: error.message};
    }
}

export default ConfirmationTokenRequest;
