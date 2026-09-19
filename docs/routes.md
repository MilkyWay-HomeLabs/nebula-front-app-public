# Application Routes

This document describes the primary React Router routes available in the Nebula Home Frontend.

## Routes Overview

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Root landing page and dashboard. |
| `/home` | `Home` | User home dashboard (alias for `/`). |
| `/confirm/:id/:token` | `ConfirmationAccount` | Account activation link with parameters. |
| `/confirm` | `ConfirmationAccount` | Fallback or initial account confirmation view. |
| `/redirect` | `Redirect` | Handle external or internal application redirects. |

## Navigation Logic

The application uses `react-router-dom` for client-side navigation. Most routes are protected and require a valid JWT session (managed via cookies/headers) to be accessible.

- **Unauthenticated Users:** Redirected to the login flow (handled via integrated components).
- **Authenticated Users:** Can access their profile dashboard and update settings.

## Deep Linking

The application supports deep linking for specific actions like account confirmation, which are often reached via email links.

