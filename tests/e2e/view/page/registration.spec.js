/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, clickE2E, DEFAULT_WAIT, SELECTORS} from '../../helpers';

test.slow();
test.setTimeout(60_000);

async function ensureRegistrationVisible(page) {
    const heading = page.locator(SELECTORS.registration.heading).first();
    await heading.waitFor({state: 'visible', timeout: DEFAULT_WAIT});
    await expect(heading).toContainText('Registration form', {timeout: DEFAULT_WAIT});
}

test.describe('Registration Form E2E', () => {
    test.beforeEach(async ({page}) => {
        // stub registration API so tests do not call backend
        await page.route('**/api/account/register', (route) => {
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({message: 'User registered', userId: 1}),
            });
        });

        await page.goto(BASE, {waitUntil: 'load', timeout: 30000});

        // Wait for the app to hydrate and render the login view before looking for
        // register-prompt -- checking count() right after 'load' races React's first
        // paint and can read 0 even though the element renders a moment later. This SPA
        // has no server-side `/register` route, so a bad fallback goto() to it just
        // strands the page ("No routes matched location \"/register\"").
        await page.locator(SELECTORS.login.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});
        await clickE2E(page, 'register-prompt');

        await ensureRegistrationVisible(page);
    });

    test('displays registration form', async ({page}) => {
        await ensureRegistrationVisible(page);
        await expect(page.locator(SELECTORS.registration.submit)).toContainText('Register Account', {timeout: 5000});
    });

    test('validates login field in real time', async ({page}) => {
        const loginInput = page.locator(SELECTORS.registration.inputLogin).first();
        await loginInput.waitFor({state: 'visible', timeout: 12000});
        await loginInput.fill('ab');

        // Force blur
        await page.locator(SELECTORS.registration.heading).first().click();

        const errorLocator = page.locator(SELECTORS.registration.loginError).first();
        await errorLocator.waitFor({state: 'visible', timeout: 7000});
        await expect(errorLocator).toBeVisible();
    });

    test('toggles password visibility', async ({page}) => {
        const passwordInput = page.locator(SELECTORS.registration.passwordInput).first();
        const toggleBtn = page.locator(SELECTORS.registration.passwordToggle).first();

        await toggleBtn.scrollIntoViewIfNeeded();
        await toggleBtn.waitFor({state: 'visible', timeout: 5000});
        await toggleBtn.click();

        await expect(passwordInput).toHaveAttribute('type', 'text', {timeout: 7000});
    });
});
