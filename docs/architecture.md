# Architecture Overview

## Layers

- **UI Layer:** React components, CSS modules, profile management views
- **State Management:** React hooks, context, Zod validation
- **API Layer:** Fetch wrappers, updaters for profile/avatar/password, validation
- **Testing:** Vitest (unit/integration), Playwright (e2e)

## Dependencies

- React, Vite, Playwright, Vitest, ESLint

## Data Flow

- User actions → UI → API wrappers → Backend
- API responses normalized as `{ success, data }`

## Folder Structure

- `src/` – main app code
- `tests/` – all test types
- `docs/` – documentation, including routes and architecture

See README.md for more details.

