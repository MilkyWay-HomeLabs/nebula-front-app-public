import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';

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
    return sendMutatingRequest(url, (csrf) => {
        const headerObj = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
            'X-XSRF-TOKEN': csrf ?? '',
        };
        const headers = (typeof Headers !== 'undefined') ? new Headers(headerObj) : (() => {
            const c = {...headerObj};
            c.get = (k) => c[Object.keys(c).find(k2 => k2.toLowerCase() === k.toLowerCase())];
            return c;
        })();
        return {
            method: 'PUT',
            credentials: 'include',
            headers,
            body: JSON.stringify(bodyData),
        };
    });
}

export default PUTRequest;
