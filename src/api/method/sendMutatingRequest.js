import {ensureCsrfToken} from '../../util/CsrfUtils';

/**
 * Generic helper for mutating fetch requests (POST/PUT/PATCH) that require CSRF.
 *
 * makeOptions is a function that receives the current csrf token (string|null) and
 * must return a fetch options object (method, credentials, headers, body, etc.).
 *
 * The helper will attempt the request once, and if a 403 CSRF-related response
 * is returned, it will refresh CSRF and retry one more time.
 *
 * Returns an object { success: boolean, data?, status?, message? }
 */
export default async function sendMutatingRequest(url, makeOptions) {
    try {
        let csrf = await ensureCsrfToken();
        let attemptedRetry = false;

        while (true) {
            const options = makeOptions(csrf);
            const response = await fetch(url, options);

            if (response.ok) {
                // try to parse json safely
                try {
                    const data = await response.json();
                    return {success: true, data};
                } catch (_) {
                    return {success: true, data: undefined};
                }
            }

            const text = await response.text();
            // log error similar to previous per-request helpers,
            // so unit tests that spy on console.error keep working
            console.error(`Error: ${response.status} - ${text}`);
            const isCsrfError = response.status === 403 && /csrf|XSRF/i.test(text);

            if (isCsrfError && !attemptedRetry) {
                attemptedRetry = true;
                // refresh token and retry
                csrf = await ensureCsrfToken();
                await new Promise((res) => setTimeout(res, 100));
                continue;
            }

            return {success: false, status: response.status, message: text};
        }
    } catch (error) {
        console.error('Error sending request:', error);
        return {success: false, message: error?.message || String(error)};
    }
}

