import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';


/**
 * Sends a PATCH request to the specified URL with the provided body data.
 * This method uses Basic Authentication and expects `APP_USERNAME` and `APP_PASSWORD` to be predefined.
 *
 * @param {string} url - The URL to send the PATCH request to.
 * @param {Object} bodyData - The payload to be sent in the body of the request.
 * @return {Promise<Object>} - A promise that resolves to an object containing the success status and either the response data or an error message.
 */
async function PATCHRequestPublic(url, bodyData) {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
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

export default PATCHRequestPublic;
