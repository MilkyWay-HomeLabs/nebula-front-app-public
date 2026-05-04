import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';

/**
 * Sends a POST request to the specified URL with the provided body data and returns the response.
 *
 * @param {string} url - The endpoint URL where the POST request will be sent.
 * @param {Object} bodyData - The data to be included in the body of the POST request.
 * @return {Promise<Object>} A promise that resolves to an object containing the response status and data,
 *                           or an error message if the request fails. The object contains:
 *                           - `success` (boolean): Indicates if the request was successful.
 *                           - `data` (Object | undefined): The parsed response JSON, if successful.
 *                           - `status` (number | undefined): The HTTP status code, if applicable.
 *                           - `message` (string): Error message, if the request fails.
 */
async function POSTRequestPublic(url, bodyData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
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

export default POSTRequestPublic;
