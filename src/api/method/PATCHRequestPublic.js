import {APP_PASSWORD, APP_USERNAME} from '../../data/Credentials';
import sendMutatingRequest from './sendMutatingRequest';


/**
 * Sends a PATCH request to the specified URL with the provided body data.
 * This method uses Basic Authentication and expects `APP_USERNAME` and `APP_PASSWORD` to be predefined.
 *
 * @param {string} url - The URL to send the PATCH request to.
 * @param {Object} bodyData - The payload to be sent in the body of the request.
 * @return {Promise<Object>} - A promise that resolves to an object containing the success status and either the response data or an error message.
 */
async function PATCHRequestPublic(url, bodyData) {
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

export default PATCHRequestPublic;
