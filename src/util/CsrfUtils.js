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

// Module-scoped promise used to deduplicate concurrent network attempts to
// obtain the CSRF cookie. When set, callers will await this promise rather
// than issuing parallel requests.
let csrfPromise = null;

/**
 * Ensures that the XSRF-TOKEN cookie is present.
 * If not, performs a lightweight GET request to the backend so that
 * Spring Security sets the cookie in the response. Deduplicates concurrent
 * attempts and optionally performs a single POST probe controlled by
 * VITE_CSRF_PROBE (disabled by default) as a last resort.
 *
 * @returns {Promise<string|null>} The CSRF token value.
 */
export async function ensureCsrfToken() {
    // In test mode (Vitest) avoid performing network probes; tests should
    // mock fetch or the CSRF token directly. import.meta.env.MODE is set by Vite/Vitest.
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test') {
            return getCsrfToken();
        }
    } catch (_) {
        // ignore if import.meta not available
    }

    if (getCsrfToken()) {
        return getCsrfToken();
    }

    // Deduplicate concurrent probes
    if (csrfPromise) {
        try {
            await csrfPromise;
        } catch (_) {
            // ignore
        }
        return getCsrfToken();
    }

    csrfPromise = (async () => {
        // First attempt: lightweight GET to the API base. In some backends this may
        // return 401 but still trigger CSRF cookie generation.
        try {
            await fetch(APP_REQUEST_URL, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });
        } catch (_) {
            // ignore – the goal is only to receive the Set-Cookie header
        }

        if (getCsrfToken()) {
            return getCsrfToken();
        }

        // Retry GET once with a short delay — this avoids hammering the server
        // while still allowing transient infra delays to settle.
        await new Promise((res) => setTimeout(res, 200));
        try {
            await fetch(APP_REQUEST_URL, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });
        } catch (_) {}
        if (getCsrfToken()) {
            return getCsrfToken();
        }

        // As a last resort, optionally do a single POST probe to provoke cookie
        // issuance. Controlled by env flag VITE_CSRF_PROBE to avoid noisy logs in
        // production unless explicitly enabled.
        let probeEnabled;
        try {
            probeEnabled = !!(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CSRF_PROBE === 'true');
        } catch (_) {
            probeEnabled = false;
        }

        if (probeEnabled) {
            const loginProbe = `${APP_REQUEST_URL}/account/token`;
            try {
                await fetch(loginProbe, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({}),
                });
            } catch (_) {
                // ignore
            }
            await new Promise((res) => setTimeout(res, 150));
            return getCsrfToken();
        }

        return null;
    })();

    try {
        await csrfPromise;
    } finally {
        csrfPromise = null;
    }

    return getCsrfToken();
}
