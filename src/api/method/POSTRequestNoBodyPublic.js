import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import {ensureCsrfToken} from '../../util/CsrfUtils';

/**
 * Sends a POST request to the specified URL without a request body.
 * This method includes basic authentication headers and processes the response.
 *
 * @param {string} url - The URL to send the POST request to.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 * response data (if any), or an error message and status code in case of failure.
 */
async function POSTRequestNoBodyPublic(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
                'X-XSRF-TOKEN': await ensureCsrfToken() ?? '',
            }),
        });
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error(`Error: ${response.status} - ${errorMessage}`);
            return {success: false, status: response.status, message: errorMessage};
        }
        const data = await response.json();
        return {success: true, data};
    } catch (error) {
        console.error('Error sending request:', error);
        return {success: false, message: error.message};
    }
}

export default POSTRequestNoBodyPublic;
