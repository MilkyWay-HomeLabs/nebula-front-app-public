import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';

/**
 * Sends a POST request with multipart data to the specified URL.
 *
 * @param {string} url - The URL to which the POST request will be sent.
 * @param {FormData} bodyData - The multipart data to be included in the request body.
 * @return {Promise<Object>} A promise that resolves to an object containing the success status,
 *                           response data if successful, or an error message and status if the request fails.
 */
async function POSTRequestForMultipart(url, bodyData) {
    return await sendMutatingRequest(url, (csrf) => {
        const headerObj = {
            'Authorization': 'Basic ' + btoa(`${APP_USERNAME}:${APP_PASSWORD}`),
            'X-XSRF-TOKEN': csrf ?? '',
        };
        const headers = (typeof Headers !== 'undefined') ? new Headers(headerObj) : (() => { const c = {...headerObj}; c.get = (k) => c[Object.keys(c).find(k2 => k2.toLowerCase() === k.toLowerCase())]; return c; })();
        return {
            method: 'POST',
            credentials: 'include',
            headers,
            body: bodyData,
        };
    });
}

export default POSTRequestForMultipart;
