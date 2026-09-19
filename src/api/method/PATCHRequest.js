import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';

/**
 * Sends a PATCH request to the specified URL with the provided body data.
 *
 * @param {string} url - The URL to which the PATCH request will be sent.
 * @param {Object} bodyData - The data to be included in the request body.
 * @return {Promise<Object>} A Promise that resolves to an object containing the success status,
 *         response data if successful, or an error message and status if the request fails.
 */
async function PATCHRequest(url, bodyData) {
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
            method: 'PATCH',
            credentials: 'include',
            headers,
            body: JSON.stringify(bodyData),
        };
    });
}

export default PATCHRequest;
