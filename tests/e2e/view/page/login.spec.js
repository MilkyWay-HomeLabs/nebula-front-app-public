/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT, SELECTORS} from '../../helpers';

test.describe('Login Form E2E', () => {
    test.beforeEach(async ({page}) => {
        await page.route('**/account/token', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, token: 'fake-jwt-token'}),
            });
        });

        // Home.jsx probes GET /users on boot to detect an existing session; it must
        // report "not authenticated" here so the login form renders instead of being
        // skipped. Login success in these tests comes from the /account/token mock
        // above, which Home.jsx acts on regardless of this probe's outcome.
        await page.route('**/users', (route) => {
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({success: false, error: 'UNAUTHORIZED'}),
            });
        });

        await page.goto(BASE, {waitUntil: 'load', timeout: 30000});
        await page.locator(SELECTORS.login.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});
    });

    test('displays login form', async ({page}) => {
        await expect(page.locator(SELECTORS.login.heading)).toContainText('Login');
        await expect(page.locator(SELECTORS.login.submit)).toBeVisible();
    });

    test('validates email in real time', async ({page}) => {
        const usernameInput = page.locator(SELECTORS.login.inputUsername).first();
        await usernameInput.fill('@notvalid');
        await page.locator(SELECTORS.login.heading).click(); // blur

        const error = page.locator(SELECTORS.login.usernameError).first();
        await expect(error).toBeVisible();
        await expect(error).toContainText('Please enter a valid email address');
    });

    test('toggles password visibility', async ({page}) => {
        const passwordInput = page.locator(SELECTORS.login.inputPassword).first();
        const toggle = page.locator(SELECTORS.login.passwordToggle).first();

        await expect(passwordInput).toHaveAttribute('type', 'password');
        await toggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('performs successful login', async ({page}) => {
        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');

        await page.locator(SELECTORS.login.submit).click();

        // When Home.jsx logs in, it may switch view. 
        // We look for any indication that login form is gone or home is visible.
        // If we don't have a clear "home" selector, we can check for logout or something.
        // Let's use waitFor with state hidden on the login form.
        await page.locator(SELECTORS.login.form).waitFor({state: 'hidden', timeout: 15000});
    });
});
