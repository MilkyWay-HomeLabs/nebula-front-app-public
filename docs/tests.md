# Testing and Coverage

This document provides details about the testing strategy, test division, and coverage for the Nebula Home Frontend project.

## Test Division

The project uses a pyramid testing strategy to ensure reliability and performance.

| Test Type             | Count | Proportion | Tool       |
|-----------------------|-------|------------|------------|
| **Unit Tests**        | 262   | ~57%       | Vitest     |
| **Integration Tests** | 62    | ~14%       | Vitest     |
| **E2E Tests**         | 132   | ~29%       | Playwright |

### 1. Unit Tests
- **Tool:** Vitest
- **Scope:** Individual functions, hooks, and isolated components.
- **Location:** `tests/unit/`
- **Focus:** Business logic, utility functions, API request builders, and individual component rendering.

### 2. Integration Tests
- **Tool:** Vitest
- **Scope:** Interaction between multiple components and hooks.
- **Location:** `tests/integration/`
- **Focus:** Data flow between components, API interaction handlers, and complex UI states.

### 3. End-to-End (E2E) Tests
- **Tool:** Playwright
- **Scope:** Complete user flows in a real browser environment.
- **Location:** `tests/e2e/`
- **Focus:** Authentication flows, profile management, navigation, and critical system paths.

## Test Coverage

We strive for high test coverage across all critical parts of the application.

- **Total Coverage:** **90.55%** of the codebase is covered by tests.
- **Critical Paths:** 100% coverage for authentication and profile management logic.
- **UI States:** All major UI states (loading, error, success) are verified through integration and E2E tests.

## Running Tests

### Unit and Integration Tests
To run all Vitest tests:
```bash
npm run test
```

To run with coverage report:
```bash
npm run test:coverage
```

### E2E Tests
To run all Playwright tests:
```bash
npm run test:e2e
```

To run Playwright in UI mode:
```bash
npm run test:e2e:ui
```

## Notable Test Features

- **API Stubbing:** All network calls are stubbed to ensure deterministic test results.
- **Session Simulation:** Authentication state is simulated using LocalStorage and session mocking.
- **Visibility Checks:** Precise verification of DOM element visibility, including validation hints and error messages.
- **Edge Case Handling:** Extensive testing of invalid inputs, API timeouts, and error responses.
