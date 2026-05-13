import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import {ensureCsrfToken} from '../../util/CsrfUtils';

/**
 * Sends a PUT request to the specified URL with the provided body data.
 *
 * @param {string} url - The URL to send the PUT request to.
 * @param {Object} bodyData - The data to be included in the body of the PUT request.
 * @return {Promise<Object>} - A promise that resolves to an object containing the response status and data, or an error message if the request fails. The returned object has the following structure:
 *  - success {boolean}: Indicates whether the request was successful.
 *  - data {Object|undefined}: The response data if the request was successful.
 *  - message {string|undefined}: The error message if the request failed.
 *  - status {number|undefined}: The HTTP status code if the request failed.
 */
async function PUTRequest(url, bodyData) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(url, {
            method: 'PUT',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
                'X-XSRF-TOKEN': await ensureCsrfToken() ?? '',
            }),
            body: JSON.stringify(bodyData),
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

export default PUTRequest;
