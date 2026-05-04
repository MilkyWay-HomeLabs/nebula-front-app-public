/* eslint-env node */
import { expect, test } from '@playwright/test';
import { BASE, DEFAULT_WAIT } from '../../helpers.js';

test.slow();
test.setTimeout(60_000);

const FAKE_USER = {
    id: 1,
    login: 'e2e_user',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '1990-01-15',
    nationality: { id: 180, name: 'Poland', code: 'POL' },
    gender: { id: 1, name: 'Male' },
    games: [],
    achievements: [],
};

const tinyPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

const GENDERS = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Other' },
];

const NATIONALITIES = [
    { id: 82, name: 'Germany', code: 'DEU' },
    { id: 180, name: 'Poland', code: 'POL' },
];

const THEMES = [
    { id: 1, name: 'Dark' },
    { id: 2, name: 'Light' },
    { id: 3, name: 'System' },
];

/** Inject auth state and stub all common APIs */
async function setupAuth(page) {
    await page.addInitScript((data) => {
        try {
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('authToken', 'fake-jwt-token');
        } catch (_) {}
    }, FAKE_USER);

    await page.route('**/users', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) })
    );
    await page.route('**/nebula/avatars/**', (route) =>
        route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from(tinyPng, 'base64') })
    );
    await page.route('**/genders', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(GENDERS) })
    );
    await page.route('**/nationalities', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NATIONALITIES) })
    );
    await page.route('**/themes', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(THEMES) })
    );
    await page.route('**/users/profile', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await page.route('**/users/settings', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
}

async function openSubpage(page, menuText, formTestId) {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const menuItem = page.locator('.menu-item').filter({ hasText: menuText }).first();
    await menuItem.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
    await menuItem.click();
    await page.locator(`[data-testid="${formTestId}"]`).waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
}

// ──────────────────────────────────────────────────────────────────────────────
// GenderUpdaterFetchData
// ──────────────────────────────────────────────────────────────────────────────
test.describe('GenderUpdaterFetchData – E2E', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuth(page);
    });

    test('renders gender select pre-populated with user gender in Profile Editor', async ({ page }) => {
        await openSubpage(page, 'Profile Editor', 'profile-editor-form');
        const select = page.locator('#gender-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select.locator('option')).toHaveCount(3, { timeout: DEFAULT_WAIT });
        // Pre-selected to user gender id 1
        await expect(select).toHaveValue('1');
    });

    test('loads gender options sorted alphabetically', async ({ page }) => {
        await openSubpage(page, 'Profile Editor', 'profile-editor-form');
        const select = page.locator('#gender-select');
        await expect(select.locator('option')).toHaveCount(3, { timeout: DEFAULT_WAIT });
        const options = await select.locator('option').allTextContents();
        expect(options).toEqual(['Female', 'Male', 'Other']);
    });

    test('allows changing the selected gender', async ({ page }) => {
        await openSubpage(page, 'Profile Editor', 'profile-editor-form');
        const select = page.locator('#gender-select');
        await expect(select.locator('option')).toHaveCount(3, { timeout: DEFAULT_WAIT });
        await select.selectOption('2');
        await expect(select).toHaveValue('2');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// NationalityUpdaterFetchData
// ──────────────────────────────────────────────────────────────────────────────
test.describe('NationalityUpdaterFetchData – E2E', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuth(page);
    });

    test('renders nationality select pre-populated with user nationality in Profile Editor', async ({ page }) => {
        await openSubpage(page, 'Profile Editor', 'profile-editor-form');
        const select = page.locator('#nationality-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select.locator('option')).toHaveCount(2, { timeout: DEFAULT_WAIT });
        // Pre-selected to user nationality id 180
        await expect(select).toHaveValue('180');
    });

    test('loads nationality options sorted alphabetically', async ({ page }) => {
        await openSubpage(page, 'Profile Editor', 'profile-editor-form');
        const select = page.locator('#nationality-select');
        await expect(select.locator('option')).toHaveCount(2, { timeout: DEFAULT_WAIT });
        const options = await select.locator('option').allTextContents();
        expect(options).toEqual(['Germany', 'Poland']);
    });

    test('allows changing the selected nationality', async ({ page }) => {
        await openSubpage(page, 'Profile Editor', 'profile-editor-form');
        const select = page.locator('#nationality-select');
        await expect(select.locator('option')).toHaveCount(2, { timeout: DEFAULT_WAIT });
        await select.selectOption('82');
        await expect(select).toHaveValue('82');
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// ThemeUpdaterFetchData
// ──────────────────────────────────────────────────────────────────────────────
test.describe('ThemeUpdaterFetchData – E2E', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuth(page);
    });

    test('renders theme select inside Profile Settings', async ({ page }) => {
        await openSubpage(page, 'User Settings', 'profile-settings-form');
        const select = page.locator('select.input-default').first();
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select).toBeVisible();
    });

    test('loads theme options sorted alphabetically', async ({ page }) => {
        await openSubpage(page, 'User Settings', 'profile-settings-form');
        // ThemeUpdaterFetchData has no id on the select, use the first combobox inside the settings form
        const form = page.locator('[data-testid="profile-settings-form"]');
        const select = form.locator('select').first();
        await expect(select.locator('option')).toHaveCount(3, { timeout: DEFAULT_WAIT });
        const options = await select.locator('option').allTextContents();
        expect(options).toEqual(['Dark', 'Light', 'System']);
    });

    test('allows changing the selected theme', async ({ page }) => {
        await openSubpage(page, 'User Settings', 'profile-settings-form');
        const form = page.locator('[data-testid="profile-settings-form"]');
        const select = form.locator('select').first();
        await expect(select.locator('option')).toHaveCount(3, { timeout: DEFAULT_WAIT });
        await select.selectOption('2');
        await expect(select).toHaveValue('2');
    });
});

