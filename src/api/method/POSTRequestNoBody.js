import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';


/**
 * Sends an HTTP POST request to the specified URL with predefined headers and credentials.
 * Handles response parsing and error handling.
 *
 * @param {string} url - The URL to which the POST request will be sent.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 *                           response data if successful, or an error message if the request fails.
 */
async function POSTRequestNoBody(url) {
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
        };
    });
}

export default POSTRequestNoBody;
