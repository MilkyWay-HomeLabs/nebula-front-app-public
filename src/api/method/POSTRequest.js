import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';

/**
 * Sends a POST request to the specified URL with the provided body data and returns the response.
 * Includes basic authentication and JSON content type in the request headers.
 *
 * @param {string} url - The URL to which the POST request will be sent.
 * @param {Object} bodyData - The data to be included in the body of the POST request.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 *                           response data (if successful), or failure details such as status code and error message.
 */
async function POSTRequest(url, bodyData) {
    return await sendMutatingRequest(url, (csrf) => {
        const headerObj = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
            'X-XSRF-TOKEN': csrf ?? '',
        };
        const headers = (typeof Headers !== 'undefined') ? new Headers(headerObj) : (() => { const c = {...headerObj}; c.get = (k) => c[Object.keys(c).find(k2 => k2.toLowerCase() === k.toLowerCase())]; return c; })();
        return {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify(bodyData),
        };
    });
}

export default POSTRequest;
