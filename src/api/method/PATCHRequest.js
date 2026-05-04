import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';

/**
 * Sends a PATCH request to the specified URL with the provided body data.
 *
 * @param {string} url - The URL to which the PATCH request will be sent.
 * @param {Object} bodyData - The data to be included in the request body.
 * @return {Promise<Object>} A Promise that resolves to an object containing the success status,
 *         response data if successful, or an error message and status if the request fails.
 */
async function PATCHRequest(url, bodyData) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
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

export default PATCHRequest;
