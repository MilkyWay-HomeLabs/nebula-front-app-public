/* eslint-env node */
import { expect, test } from '@playwright/test';
import { BASE, DEFAULT_WAIT } from '../../helpers.js';

test.slow();
test.setTimeout(60_000);

const GENDERS = [
    { id: '2', name: 'Male' },
    { id: '1', name: 'Female' },
    { id: '3', name: 'Other' },
];

const NATIONALITIES = [
    { id: '3', name: 'Polish' },
    { id: '1', name: 'British' },
    { id: '2', name: 'French' },
];

async function navigateToRegistration(page) {
    await page.goto(BASE, { waitUntil: 'load', timeout: 30_000 });

    const registerPrompt = page.locator('[data-e2e="register-prompt"]');
    if (await registerPrompt.count() > 0) {
        const child = registerPrompt.locator('.span-link, a, button').first();
        if (await child.count() > 0) await child.click();
        else await registerPrompt.click();
    } else {
        await page.goto(`${BASE}register`, { waitUntil: 'load', timeout: 15_000 });
    }

    await page
        .locator('[data-e2e="registration-heading"]')
        .waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
}

test.describe('GenderFetchData – E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Stub gender API
        await page.route('**/genders', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(GENDERS),
            })
        );

        // Stub nationality API so the registration page loads without errors
        await page.route('**/nationalities', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(NATIONALITIES),
            })
        );

        await navigateToRegistration(page);
    });

    test('renders gender select inside the registration form', async ({ page }) => {
        const wrapper = page.locator('[data-e2e="gender-fetch-wrapper"]');
        await wrapper.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(wrapper).toBeVisible();
    });

    test('loads and displays gender options sorted alphabetically', async ({ page }) => {
        const select = page.locator('#gender-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });

        // Wait for actual options to appear (beyond the placeholder)
        await expect(select.locator('option')).toHaveCount(4, { timeout: DEFAULT_WAIT });

        const options = await select.locator('option').allTextContents();
        expect(options).toEqual(['Select', 'Female', 'Male', 'Other']);
    });

    test('shows "Select your gender." hint when hovered with nothing selected', async ({ page }) => {
        const select = page.locator('#gender-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select.locator('option')).toHaveCount(4, { timeout: DEFAULT_WAIT });

        // span-alert is CSS-hidden by default and only becomes visible on hover/focus
        await select.hover();

        const wrapper = page.locator('[data-e2e="gender-fetch-wrapper"]');
        await expect(wrapper.locator('text=Select your gender.')).toBeVisible({
            timeout: DEFAULT_WAIT,
        });
    });

    test('hides the hint after the user selects a gender', async ({ page }) => {
        const select = page.locator('#gender-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select.locator('option')).toHaveCount(4, { timeout: DEFAULT_WAIT });

        // Hover to make span-alert visible, verify it shows, then select a value
        await select.hover();
        const wrapper = page.locator('[data-e2e="gender-fetch-wrapper"]');
        await expect(wrapper.locator('text=Select your gender.')).toBeVisible({
            timeout: DEFAULT_WAIT,
        });

        await select.selectOption('1'); // Female

        // After selection the span is removed from the DOM entirely
        await expect(wrapper.locator('text=Select your gender.')).toHaveCount(0);
    });
});

test.describe('NationalityFetchData – E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/genders', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(GENDERS),
            })
        );

        await page.route('**/nationalities', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(NATIONALITIES),
            })
        );

        await navigateToRegistration(page);
    });

    test('renders nationality select inside the registration form', async ({ page }) => {
        const wrapper = page.locator('[data-e2e="nationality-fetch-wrapper"]');
        await wrapper.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(wrapper).toBeVisible();
    });

    test('loads and displays nationality options sorted alphabetically', async ({ page }) => {
        const select = page.locator('#nationality-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });

        await expect(select.locator('option')).toHaveCount(4, { timeout: DEFAULT_WAIT });

        const options = await select.locator('option').allTextContents();
        expect(options).toEqual(['Select', 'British', 'French', 'Polish']);
    });

    test('shows "Select your nationality from list." hint when hovered with nothing selected', async ({ page }) => {
        const select = page.locator('#nationality-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select.locator('option')).toHaveCount(4, { timeout: DEFAULT_WAIT });

        // span-alert is CSS-hidden by default and only becomes visible on hover/focus
        await select.hover();

        const wrapper = page.locator('[data-e2e="nationality-fetch-wrapper"]');
        await expect(
            wrapper.locator('text=Select your nationality from list.')
        ).toBeVisible({ timeout: DEFAULT_WAIT });
    });

    test('hides the hint after the user selects a nationality', async ({ page }) => {
        const select = page.locator('#nationality-select');
        await select.waitFor({ state: 'visible', timeout: DEFAULT_WAIT });
        await expect(select.locator('option')).toHaveCount(4, { timeout: DEFAULT_WAIT });

        // Hover to make span-alert visible, verify it shows, then select a value
        await select.hover();
        const wrapper = page.locator('[data-e2e="nationality-fetch-wrapper"]');
        await expect(
            wrapper.locator('text=Select your nationality from list.')
        ).toBeVisible({ timeout: DEFAULT_WAIT });

        await select.selectOption('3'); // Polish

        // After selection the span is removed from the DOM entirely
        await expect(
            wrapper.locator('text=Select your nationality from list.')
        ).toHaveCount(0);
    });
});

