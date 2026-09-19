import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';

/**
 * Sends a POST request to the specified URL without a request body.
 * This method includes basic authentication headers and processes the response.
 *
 * @param {string} url - The URL to send the POST request to.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 * response data (if any), or an error message and status code in case of failure.
 */
async function POSTRequestNoBodyPublic(url) {
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

export default POSTRequestNoBodyPublic;
