import {APP_REQUEST_URL} from '../data/Credentials';

/**
 * Reads the XSRF-TOKEN cookie set by Spring Security's CookieCsrfTokenRepository
 * and returns its value to be sent in the X-XSRF-TOKEN request header.
 *
 * @returns {string|null} The CSRF token value, or null if the cookie is not present.
 */
export function getCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Ensures that the XSRF-TOKEN cookie is present.
 * If not, performs a lightweight GET request to the backend so that
 * Spring Security sets the cookie in the response.
 *
 * @returns {Promise<string|null>} The CSRF token value.
 */
export async function ensureCsrfToken() {
    if (getCsrfToken()) {
        return getCsrfToken();
    }
    try {
        await fetch(APP_REQUEST_URL, {
            method: 'GET',
            credentials: 'include',
        });
    } catch (_) {
        // ignore – the goal is only to receive the Set-Cookie header
    }
    return getCsrfToken();
}

