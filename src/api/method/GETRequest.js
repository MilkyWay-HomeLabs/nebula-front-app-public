import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';

/**
 * Sends a GET request to the specified URL with credentials included.
 * The request uses Basic Authentication and expects a JSON response.
 *
 * @param {string} url - The URL to which the GET request will be sent.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 *                           response data if successful, or an error message and status if the request fails.
 */
async function GETRequest(url) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`)
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

export default GETRequest;
