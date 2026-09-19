import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';

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

export default POSTRequestPublic;
