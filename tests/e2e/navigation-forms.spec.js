/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, clickE2E, DEFAULT_WAIT, getHeadingText, SELECTORS} from './helpers';

async function gotoBase(page) {
    await page.goto(BASE, {waitUntil: 'load', timeout: 60000});
    await page.locator(SELECTORS.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});
}

async function goToLogin(page) {
    const current = await getHeadingText(page);
    if (current.includes('Login')) return;

    if (await page.locator(SELECTORS.registration.loginLink).count() > 0) {
        await clickE2E(page, 'link-login');
    } else if (await page.locator(SELECTORS.recovery.loginWrapper).count() > 0) {
        await clickE2E(page, 'link-login-wrapper');
    } else {
        await page.getByText('Login', {exact: true}).click();
    }
    await expect(page.locator(SELECTORS.login.heading)).toContainText('Login', {timeout: DEFAULT_WAIT});
}

async function goToRegistration(page) {
    const current = await getHeadingText(page);
    if (current.includes('Registration')) return;

    if (await page.locator(SELECTORS.login.registerPrompt).count() > 0) {
        await clickE2E(page, 'register-prompt');
    } else if (await page.locator(SELECTORS.recovery.registerWrapper).count() > 0) {
        await clickE2E(page, 'link-register-wrapper');
    } else {
        await page.getByText('Create account', {exact: true}).click();
    }
    await expect(page.locator(SELECTORS.registration.heading)).toContainText('Registration form', {timeout: DEFAULT_WAIT});
}

async function goToRecovery(page) {
    const current = await getHeadingText(page);
    if (current.includes('Password recovery')) return;

    if (await page.locator(SELECTORS.login.recoveryPrompt).count() > 0) {
        await clickE2E(page, 'recovery-prompt');
    } else if (await page.locator(SELECTORS.registration.recoveryLink).count() > 0) {
        await clickE2E(page, 'link-recovery');
    } else {
        await page.getByText('Restore it', {exact: true}).click();
    }
    await expect(page.locator(SELECTORS.recovery.heading)).toContainText('Password recovery', {timeout: DEFAULT_WAIT});
}

test.describe('Navigation forms', () => {
    test.beforeEach(async ({page}) => {
        // Mock API responses to prevent timeouts and external dependency issues on CI
        await page.route('**/account/token', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, token: 'fake-jwt-token'}),
            });
        });

        await page.route('**/user/data', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({id: 1, login: 'testuser'}),
            });
        });

        await page.route('**/account/reset-password/**', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true}),
            });
        });

        await page.route('**/account/register', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true}),
            });
        });

        await gotoBase(page);
    });

    test('navigate-from-login-to-registration', async ({page}) => {
        await goToLogin(page);
        await goToRegistration(page);
    });

    test('navigate-from-login-to-recovery', async ({page}) => {
        await goToLogin(page);
        await goToRecovery(page);
    });

    test('navigate-from-registration-to-login', async ({page}) => {
        await goToRegistration(page);
        await goToLogin(page);
    });

    test('navigate-registration-to-recovery', async ({page}) => {
        await goToRegistration(page);
        await goToRecovery(page);
    });

    test('navigate-from-recovery-to-login', async ({page}) => {
        await goToRecovery(page);
        await goToLogin(page);
    });

    test('navigate-recovery-to-registration', async ({page}) => {
        await goToRecovery(page);
        await goToRegistration(page);
    });
});
