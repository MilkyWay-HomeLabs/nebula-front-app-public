import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';

/**
 * Sends a POST request with multipart data to the specified URL.
 *
 * @param {string} url - The URL to which the POST request will be sent.
 * @param {FormData} bodyData - The multipart data to be included in the request body.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 *                           response data if successful, or an error message and status if the request fails.
 */
async function POSTRequestForMultipart(url, bodyData) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Authorization': token ? `Bearer ${token}` : 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
            }),
            body: bodyData,
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

export default POSTRequestForMultipart;
