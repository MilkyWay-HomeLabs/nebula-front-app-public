# Changelog

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
