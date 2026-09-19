# Changelog

## [4.6.0] - 2026-09-19

### Added
- **Achievements per-source badge**: the Achievements table now renders a small badge for
  `achievement.source` (Chess, Robak, Element, Racer, ...) in a new "Game" column, falling back to a
  neutral "—" placeholder when the field is absent — degrades cleanly on the current `/users` response
  shape, which does not populate `source` yet. Empty-state copy now sets the expectation that
  achievements arrive from playing games, instead of a bare "No achievements yet."
- **Authentication guide**: added `docs/authentication.md`, documenting token refresh and external
  redirect behavior, linked from the README.
- **Production deploy workflow for K3s**: new `deploy-prod.yml` GitHub Actions workflow plus
  `ci/nebula-front/Dockerfile` and `nginx.conf` for building and shipping the production image.
- **Prometheus exporter support**: nginx now exposes a loopback-only `/nginx_status` endpoint so an
  `nginx-prometheus-exporter` sidecar in the k3s Deployment can republish nginx metrics on prod,
  matching the `job="nebula-front"` metrics already available in the test environment.
- **CI reporting to the Hub**: build status (P4-4) and documentation/README presence (P5-1) are now
  reported to the Hub as part of the CI pipeline, using `ci/hub-report.sh` and
  `ci/hub_status_payload.py` synced from `ci-templates/spa-static`.

### Notes
- Backend follow-up needed to thread `source`/`externalId` through `NebulaUserAchievement` so the new
  per-source badge shows real data end-to-end (currently only the separate
  `/users/achievements/list` endpoint's nested DTO carries `source`).

---

## [4.5.0] - 2026-07-11

### Changed
- **Cookie-based auth transport (stop sending `Bearer` from `localStorage`)**: Andromeda is
  cookie-based (httpOnly) — it authenticates requests via httpOnly cookies, not a body/`localStorage`
  token. All request helpers (`GETRequest`, `POSTRequest`, `PATCHRequest`, `PUTRequest`,
  `POSTRequestNoBody`, `POSTRequestForMultipart`) no longer read `localStorage.authToken` nor send an
  `Authorization: Bearer` header. They now send the `Basic` app credential as the baseline and rely on
  `credentials: 'include'` (already present) so the browser attaches the httpOnly cookies that carry
  user identity. This resolves the Bearer-vs-cookie ambiguity flagged in the `[4.4.0]` notes: the
  httpOnly cookie is the source of truth, and the app can no longer retry a request with a stale Bearer.
- **Cookie-native session detection (drop `localStorage.authToken` entirely)**: `Home.jsx` and
  `Redirect.jsx` no longer read/write `localStorage.authToken` as a session marker. Since JS cannot see
  the httpOnly cookie, session state is now derived from cached `userData` (instant paint) plus a server
  probe via `UserDataRequest` — a valid session cookie returns the user and restores the session; a
  missing/expired cookie returns `null` and the login form is shown. Login (`handlerUserLogin.js`,
  `Home.jsx`) no longer persists a token — the httpOnly cookie is set by the login response.

### Removed
- **`RefreshAccess` no longer persists a token client-side**: since the refresh endpoint does not
  return an access token in its body (it rotates the httpOnly access cookie server-side), `RefreshAccess`
  no longer reads `response.data.token` / writes `localStorage.authToken`. It simply issues the refresh
  and returns the response; the rotated cookie is applied by the browser via `credentials: 'include'`.
  This reverts the `localStorage` persistence added in `[4.4.0]`, which could never fire against a
  cookie-based server.
- **`localStorage.authToken` is gone from the whole frontend** — no request helper, route, or handler
  reads or writes it anymore.

### Testing
- Updated `GETRequest` / `POSTRequest` unit tests to assert `Basic` auth + `credentials: 'include'`
  and that no `Bearer` header is ever sent (even when a stale `authToken` lingers in `localStorage`).
- Updated `RefreshAccess` unit test to assert the refresh does not touch `localStorage`.
- Updated `Home` unit/integration tests for the cookie-native boot probe: a `beforeEach` defaults
  `UserDataRequest` to "no active session" (login form shown), and the successful-login cases return
  `null` on the boot probe then the user after login. Full unit + integration suite (340 tests) passes.

### Notes
- The `502 BAD_GATEWAY` seen on `/token/refresh/access` (message
  `"Failed to execute account request for URL: /api/v1/auth/refresh-access"`) originates in the Nebula
  backend when its server-side call to Andromeda fails — it is **not** a frontend issue and is not
  addressed here. It must be investigated in Nebula↔Andromeda (Andromeda reachability/health and
  whether Nebula forwards the `Cookie` header with `refreshToken` to Andromeda).
- **Logout is a known gap**: an httpOnly cookie cannot be cleared from JavaScript, so `handleLogout`
  only clears cached client-side state (`userData`, `sessionStorage`). A backend **logout endpoint**
  (pending the Nebula API contract) must be called to invalidate the server-side session and expire the
  cookie; a `TODO` marks the call site in `Home.jsx`.

---

## [4.4.0] - 2026-07-11

### Fixed
- **Token Refresh on Expired Access Token**: `handlerTokenRefresh` now attempts a token
  refresh when the Andromeda authorization server rejects a request with
  `401 UNAUTHORIZED` / "Authentication is required." (in addition to the existing
  `TOKEN_EXPIRED` shape). `isTokenExpired` now also parses the JSON error envelope
  returned in the response `message`, and falls back to treating any `401` from a
  protected request as a refresh candidate. Previously mutating requests such as
  `PUT /users/settings` failed with `401` instead of transparently refreshing the
  access token and retrying while the refresh token was still valid.
- **Refresh Call No Longer Sends the Expired Bearer**: `RefreshAccess` now uses
  `POSTRequestNoBodyPublic` (Basic auth) instead of `POSTRequestNoBody`, so the
  refresh request relies solely on the httpOnly refresh cookie and no longer carries
  the already-expired `Authorization: Bearer` header that the authorization server
  would reject — the refresh could previously never succeed.

### Added
- `RefreshAccess` persists a rotated access token to `localStorage` (`authToken`)
  when the refresh response body contains one.
- Unit tests (`tests/unit/api/handler/handlerTokenRefresh.unit.test.js`) covering the
  `401 UNAUTHORIZED` refresh-and-retry path and the refresh-failure fallthrough.

### Testing
- **Web Storage in tests**: The bundled jsdom build does not expose `localStorage` /
  `sessionStorage`, which caused ~20 unit tests that persist tokens/user data to fail.
  Added an in-memory `Storage` polyfill in `src/test/setup.js` (registered as the global
  `Storage` so `Storage.prototype` spies work) and pinned a concrete jsdom origin
  (`environmentOptions.jsdom.url`) in `vite.config.js`. The full unit suite now passes.

### CI/CD
- **Artifact uploads no longer block the deploy**: All `actions/upload-artifact` steps in
  `deploy.yml` now use `continue-on-error: true` and a short `retention-days: 5`. The
  deploy runs on a self-hosted runner and publishes directly from the local `dist/`, so a
  GitHub artifact-storage quota error must never fail the deploy job. Reduced retention
  also keeps future artifact-storage usage low.

### Notes
- The frontend authorizes requests with **both** an `Authorization: Bearer` header read
  from `localStorage.authToken` **and** the httpOnly cookies managed by Andromeda. If
  Andromeda validates the Bearer header (not the cookie) and the refresh response does
  not return a rotated token in its body, the retried request will still send the stale
  Bearer and may fail. The Bearer-vs-cookie source of truth should be confirmed with the
  Andromeda authorization server contract.

---

## [4.2.8] - 2026-05-28

### Added
- **Smart Redirects**: Introduced a centralized redirection mechanism for the `/redirect` route.
- **Auto-Login Support**: Components now check for existing sessions and perform automatic redirection to the requested `destination` if the user is already authenticated.
- **Cache-First Redirection**: Uses `localStorage` (userData) to perform instant jumps to games, improving user experience by eliminating loading flickers.

### Fixed
- **API Path Duplication**: Corrected an issue where API URLs were incorrectly constructed with duplicate `/api` or `/nebula-rest-api` segments.
- **Redirection Race Condition**: Fixed a bug where internal SPA navigation would sometimes override external game redirections.
- **Case Sensitivity**: Destination matching is now case-insensitive, making it more robust against varied URL parameters.
- **Test Stability**: Updated unit, integration, and E2E tests to handle asynchronous loading states and new API structures.

### Changed
- Refactored `handleUserLogin` and `Redirect` component to share the same redirection logic via `performRedirection` helper.
- Updated `README.md` with detailed redirection documentation and current project version.

---

## [4.1.0] - 2026-05-13

### Security
- Added `src/util/CsrfUtils.js` with two helpers:
  - `getCsrfToken()` — reads raw CSRF token from the `XSRF-TOKEN` cookie set by
    Spring Security's `CookieCsrfTokenRepository`
  - `ensureCsrfToken()` — lazily fetches backend root if cookie is not yet present,
    ensuring the token is available before any state-mutating request
- All state-mutating request helpers now include the `X-XSRF-TOKEN` header:
  `POSTRequest`, `POSTRequestPublic`, `POSTRequestNoBody`, `POSTRequestNoBodyPublic`,
  `POSTRequestForMultipart`, `PATCHRequest`, `PATCHRequestPublic`, `PUTRequest`
- Public request helpers (`POSTRequestPublic`, `POSTRequestNoBodyPublic`,
  `PATCHRequestPublic`) now send `credentials: 'include'` so the browser attaches
  session cookies (required for CSRF cookie exchange)

### Notes
- Spring Security 6 backend must use `CsrfTokenRequestAttributeHandler` together
  with `CookieCsrfTokenRepository.withHttpOnlyFalse()` for the frontend raw-token
  flow to work (default `XorCsrfTokenRequestAttributeHandler` is incompatible with
  raw-cookie approach used here)

---

## [4.0.0-Public Beta] - 2026-05-04

### Theme & Visual improvements
- Added `--game-tile-bg`, `--game-tile-border`, `--game-tile-hover` CSS variables to all 18 themes
  — game cards are now clearly visible on both light and dark backgrounds
- Added `--menu-item-hover` CSS variable to all themes
  — menu item hover highlight is now theme-aware and visible on all header colors
  (light headers use a dark overlay; dark headers use a light overlay)
- Fixed `--game-button-filter` for all themes:
  - `:root` base: changed from nonsensical `hue-rotate(1000deg)` to `none`
  - Earth and Gravity themes: raised `brightness` from 55–60% to 80% — icons were too dark
  - Thunder, Electro, Wind: improved filter contrast and hue accuracy
  - Water, Sonic, Atom, Virus, Poison, Ki, Holy, Default, Dark, Umbra: recalibrated filters
    for better icon/background contrast ratio
- Improved `--border-color-third` for Dark and Umbra themes
  — footer separator border is now visible on very dark body backgrounds
- `Games.css`: replaced hardcoded `rgba(0,0,0,0.03/0.04)` with theme variables
  — game tiles are no longer invisible on dark themes
- `Games.css`: `.game-sub` color changed from hardcoded `rgba(0,0,0,0.45)` to
  `var(--general-text-color-body)` — subtitle text readable on all themes
- `Menu.css`: `.menu-item:hover` uses `var(--menu-item-hover)` instead of `rgba(255,255,255,0.03)`

### Bug Fixes
- Fixed infinite GET loop for genders and nationalities in the registration form
  — fetch was re-triggered on every render; now properly memoized/guarded
- Fixed HTTP 400 error on expired JWT token
  — app now detects token expiry and redirects to login instead of sending an invalid request

### Dependencies
- Upgraded Vite to `^8.0.5` (security fix)

### Documentation & Repository
- `contributing.md` written in English
- `README.md` updated with current version badge and coverage (89.81%)
- Added `playwright-report/`, `test-results/`, `playwright-debug-*.png` to `.gitignore`
  — test artifacts will not be published to public repository

---

## [3.33.0] - 2026-04

### Fixes & Refactoring
- Corrected documentation to reflect React routing instead of backend endpoints
- Unified API response handling (`{success, data}` everywhere)
- Fixed login logic to support both username and email
- Improved validation and error messages
- Refactored `useFetchSortedData` and all fetcher/updater components
- Added full test coverage: unit, integration, e2e
- Fixed CSS visibility issues for validation hints
- Added Playwright e2e tests for registration, profile editor, updaters
- Improved test mocks and API stubbing

---

## [2.00] - first public release
- Initial public release of the integrated Nebula Home Frontend
- User registration, login, password recovery
- Profile editor, settings, avatar upload
- Basic e2e and unit test coverage

---

## [1.00] - alpha
- Initial project setup and core architecture
- Prototyping basic UI components
- Setting up the development environment and testing infrastructure
