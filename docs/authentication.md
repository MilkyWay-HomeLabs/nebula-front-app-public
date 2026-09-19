# Authentication, Token Refresh & External Redirects

This document describes how the **Nebula Home** front-end authenticates users,
keeps a session alive, and hands users off to external MilkyWay applications
(games). It is the client-side counterpart to the Nebula REST API
[Authentication & Token Integration Guide](#reference) — here we document what
*this* app actually does in code, not the server contract.

> **Reference:** the server contract (endpoints, cookie attributes, rotation,
> CSRF rules) lives in the `nebula-rest-api` repo's *Authentication & Token
> Integration Guide*. This doc assumes that contract and focuses on the
> front-end implementation under `src/api/**` and `src/view/route/Redirect.jsx`.

---

## Table of contents

1. [Model in one paragraph](#1-model-in-one-paragraph)
2. [Two auth layers](#2-two-auth-layers)
3. [Configuration](#3-configuration)
4. [Request wrappers](#4-request-wrappers)
5. [CSRF bootstrap](#5-csrf-bootstrap)
6. [Login](#6-login)
7. [Calling protected endpoints & token refresh](#7-calling-protected-endpoints--token-refresh)
8. [Session end](#8-session-end)
9. [Redirect system for external applications](#9-redirect-system-for-external-applications)
10. [End-to-end flow](#10-end-to-end-flow)
11. [File map](#11-file-map)

---

## 1. Model in one paragraph

Authentication is **cookie-based**. On login Nebula sets `HttpOnly` cookies
(`accessToken`, `refreshToken`) that the browser stores and replays
automatically. The front-end **never reads, stores, or forwards the JWTs** —
every request is issued with `credentials: 'include'` so the cookies travel with
it, and the access token is refreshed by calling a dedicated endpoint that
rotates the cookies server-side. The only user state the client persists is a
non-secret profile snapshot (`userData`) in `localStorage`, used for UI and for
fast redirect decisions.

This is the current model after the migration away from `Bearer` tokens in
`localStorage` (commits `b4448b7`, `391a946`).

---

## 2. Two auth layers

Every request carries **two independent credentials**. Do not confuse them:

| Layer | What | Where set | Purpose |
|-------|------|-----------|---------|
| **Gateway Basic auth** | `Authorization: Basic base64(VITE_USERNAME:VITE_PASSWORD)` | Every request wrapper (`GETRequest`, `POSTRequestPublic`, …) | Static app-level credential in front of the API gateway. Same for all users. |
| **Session cookie** | `accessToken` / `refreshToken` `HttpOnly` cookies | Set by the server on login/refresh; sent automatically via `credentials: 'include'` | Identifies the logged-in user; drives per-user authorization. |

The Basic header authenticates the *application*; the cookie authenticates the
*user*. The `VITE_USERNAME` / `VITE_PASSWORD` values are shipped in the built
bundle, so treat them as a low-value gateway key, not a secret.

---

## 3. Configuration

Read from Vite env vars in `src/data/Credentials.js` (trailing slashes trimmed):

| Env var | Constant | Used for |
|---------|----------|----------|
| `VITE_REQUEST_URL` | `APP_REQUEST_URL` | Business API base (`/api/v1`): login, refresh, `/users`, account. |
| `VITE_TOMCAT_DOMAIN` | `APP_TOMCAT_DOMAIN` | Games service base — note the enabled-games call hits `${APP_TOMCAT_DOMAIN}/v1/games/enabled` directly, **not** through `APP_REQUEST_URL`. |
| `VITE_USERNAME` / `VITE_PASSWORD` | `APP_USERNAME` / `APP_PASSWORD` | Gateway Basic auth header (see [§2](#2-two-auth-layers)). |
| `VITE_APACHE_DOMAIN` / `VITE_RESOURCES_DOMAIN` | — | Static assets / resources. |
| `VITE_CSRF_PROBE` | — | Optional; enables a last-resort POST probe to prime the CSRF cookie (default `false`). |

Because the cookies are `Secure`, the app must be served over **HTTPS** and the
API origin must be in Nebula's allowed-origin patterns for credentialed CORS.

---

## 4. Request wrappers

All HTTP goes through thin wrappers in `src/api/method/`. Two axes:

- **Public vs. protected** — "public" wrappers are used for endpoints that don't
  require a live session and are *not* run through the refresh retry loop.
- **Safe (GET) vs. mutating (POST/PUT/PATCH)** — mutating requests go through
  `sendMutatingRequest`, which attaches the CSRF token and retries once on a
  CSRF failure. Safe requests skip CSRF.

Every wrapper sets `credentials: 'include'` (so the session cookie flows) and the
Basic auth header. `sendMutatingRequest` normalizes all responses to a common
envelope:

```js
{ success: boolean, data?, status?, message? }
```

The **protected** variants are not the raw wrappers — they are re-exported from
`src/api/handler/handlerTokenRefresh.js` wrapped in the refresh-retry logic
([§7](#7-calling-protected-endpoints--token-refresh)). Import `GETRequest`,
`POSTRequest`, etc. **from the handler**, not from `src/api/method/`, whenever
the call needs a session.

---

## 5. CSRF bootstrap

`src/util/CsrfUtils.js` implements Spring Security's cookie/header CSRF scheme:

1. `getCsrfToken()` reads the JS-readable `XSRF-TOKEN` cookie.
2. `ensureCsrfToken()` returns it, or — if absent — issues a lightweight
   `GET APP_REQUEST_URL` (with `credentials: 'include'`) so the server sets the
   cookie, retries once after 200 ms, and optionally does a single POST probe
   when `VITE_CSRF_PROBE=true`. Concurrent callers are de-duplicated via a
   shared promise; in Vitest (`MODE === 'test'`) no network probe is performed.

`sendMutatingRequest` calls `ensureCsrfToken()` before each mutating request,
sends the value as the `X-XSRF-TOKEN` header, and if the response is a
`403` matching `/csrf|XSRF/i` it refreshes the token and retries **once**.

---

## 6. Login

- **Function:** `LoginUserRequest(loginData)` → `POST ${APP_REQUEST_URL}/account/token`
  via `POSTRequestPublic` (CSRF + Basic + `credentials: 'include'`).
- **Body:** `{ email, password }` (the `email` field accepts an email *or* a
  username; the server resolves it).
- **Success:** `{ success: true, data: { username, email } }`. The auth cookies
  are set by the server response; **nothing token-related is stored client-side.**
- **Orchestration:** `handleUserLogin()` in `src/api/handler/handlerUserLogin.js`
  runs on success:
  1. calls `UserDataRequest()` (`GET ${APP_REQUEST_URL}/users`) to load the
     profile + the user's games,
  2. persists that snapshot via `UserData.saveUserData()` → `localStorage["userData"]`,
  3. performs redirect / navigation ([§9](#9-redirect-system-for-external-applications)).
- **Failure:** invalid credentials or a null response set `loginError` and keep
  the login form visible.

---

## 7. Calling protected endpoints & token refresh

Protected calls use the wrappers re-exported from
`src/api/handler/handlerTokenRefresh.js`, each wrapped by
`executeWithTokenRefresh`:

```
run request ─▶ success?  ─ yes ─▶ return
     │            │
     │            no, and looks like an expired token
     ▼
 RefreshAccess() ─▶ success? ─ yes ─▶ re-run the original request once
                     │
                     no ─▶ return the original failure (session over)
```

- **Expiry detection** — `isTokenExpired(response)` treats a response as
  refreshable when the status is `401` (also on `TOKEN_EXPIRED` / `UNAUTHORIZED`
  / "Authentication is required" markers, and some `400 Bad Request` cases). In
  practice **any `401` from a protected call triggers a refresh attempt.**
- **Refresh** — `RefreshAccess()` (`src/api/token/RefreshAccess.js`) issues
  `POST ${APP_REQUEST_URL}/token/refresh/access` with **no body** via
  `POSTRequestNoBodyPublic`. The `refreshToken` cookie travels automatically; the
  server rotates both cookies and returns `{ success: true, type: "ACCESS_REFRESHED" }`.
  There is nothing to persist — the browser picks up the rotated cookies.
- **Retry policy** — exactly **one** refresh + **one** replay of the original
  request. If the refresh itself fails (e.g. `401` because the refresh token was
  rotated/expired or the session cap was reached), the original failure is
  returned and the user must log in again.

> The client only ever calls two auth endpoints — `/account/token` and
> `/token/refresh/access`. JWT *validation* happens server-side; the front-end
> never inspects the tokens.

---

## 8. Session end

There is no logout endpoint. A session ends when the access token expires and the
refresh fails (rotated/expired refresh token or the session cap is reached). On
the client, ending a session means dropping local state:

- the auth cookies expire or are cleared by the browser;
- `UserData.clearUserData()` removes the `userData` snapshot from `localStorage`.

---

## 9. Redirect system for external applications

External MilkyWay applications (games) are launched from Nebula Home through the
`/redirect` route (`src/view/route/Redirect.jsx`). Because the session lives in
cookies scoped to the shared `*.milkyway` domain family, once the user has a
valid session the target app inherits it automatically when the browser
navigates to the game's URL — no token is passed in the URL.

### Entry point

```
/redirect?destination=<gameName>
```

`destination` is the case-insensitive **name** of the target game.

### Flow

1. **Load enabled games** — `fetchEnabledGames()` calls
   `GET ${APP_TOMCAT_DOMAIN}/v1/games/enabled` (public) to get the catalogue of
   games and their `pageUrl`s.
2. **Auto-login probe** — `checkAutoLogin()`:
   - first tries the cached `userData.games` from `localStorage` for an instant
     redirect;
   - otherwise probes the server with `UserDataRequest()`. A valid session cookie
     returns the user (→ save snapshot, attempt redirect); a missing/expired
     cookie returns `null` and the flow falls through to the login form.
3. **Login (if needed)** — `LoginForm` is shown; on submit `handleUserLogin()`
   authenticates and then attempts the redirect.
4. **Resolve & redirect** — `performRedirection(userGames, publicGames, destination, navigate)`:
   - matches `destination` against the **user's** games first, then the public
     **enabled** games (case-insensitive on `name`);
   - if a match with a `pageUrl` is found, navigates the browser to that URL
     using several strategies for robustness (`location.href`, `location.assign`,
     then a deferred `location.replace` / `window.open('_self')` / synthetic
     anchor click);
   - returns `true` when a redirect was initiated, `false` otherwise.

### No destination / no match

- **No `destination`:** after a successful login the user is sent to `/` (home).
- **`destination` given but no matching game:** the app stays on `/redirect`,
  stops the processing overlay, and shows the login form again (a 2 s watchdog in
  `handleLogin` clears the "Processing…" state if we're still on `/redirect`).

---

## 10. End-to-end flow

```
0. (browser) CSRF bootstrap: GET APP_REQUEST_URL → XSRF-TOKEN cookie
1. Login:    POST /api/v1/account/token   (email + password, X-XSRF-TOKEN, Basic, credentials:include)
             → 200 { success, data:{username,email} }, Set-Cookie: accessToken; refreshToken
2. Profile:  GET  /api/v1/users           (cookie sent automatically) → save userData
3. Protected call → 401 (access expired)
             → POST /api/v1/token/refresh/access (no body) → rotates cookies
             → replay the original call once
4. Redirect: match ?destination against enabled/user games → navigate to game.pageUrl
             (target app inherits the session cookie)
5. Session over: refresh returns 401 → clear userData → show login
```

---

## 11. File map

| Concern | File |
|---------|------|
| Config / env | `src/data/Credentials.js` |
| Login request | `src/api/account/LoginUserRequest.js` |
| Login orchestration + redirect | `src/api/handler/handlerUserLogin.js` |
| Refresh call | `src/api/token/RefreshAccess.js` |
| Refresh-retry wrappers (protected GET/POST/…) | `src/api/handler/handlerTokenRefresh.js` |
| Mutating request + CSRF retry | `src/api/method/sendMutatingRequest.js` |
| Raw method wrappers | `src/api/method/*.js` |
| CSRF token handling | `src/util/CsrfUtils.js` |
| Profile fetch | `src/api/user/UserDataRequest.js` |
| Local profile snapshot | `src/data/UserData.js` |
| External redirect route | `src/view/route/Redirect.jsx` |
| Routes table | `docs/routes.md` |

---

<a id="reference"></a>
*Server-side contract: see the `nebula-rest-api` **Authentication & Token
Integration Guide** and `SECURITY.md` / `ENDPOINTS.md` in that repo.*
