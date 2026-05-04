/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, clickE2E, DEFAULT_WAIT, SELECTORS} from '../../helpers';

test.describe('Password Recovery E2E', () => {
    test.beforeEach(async ({page}) => {
        await page.route('**/account/reset-password/**', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true}),
            });
        });

        await page.goto(BASE, {waitUntil: 'load', timeout: 30000});

        // Navigate from login to recovery
        await clickE2E(page, 'recovery-prompt');
        await page.locator(SELECTORS.recovery.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});
    });

    test('displays recovery form', async ({page}) => {
        await expect(page.locator(SELECTORS.recovery.heading)).toContainText('Password recovery');
        await expect(page.locator(SELECTORS.recovery.inputEmail)).toBeVisible();
    });

    test('validates email in real time', async ({page}) => {
        const emailInput = page.locator(SELECTORS.recovery.inputEmail).first();
        await emailInput.fill('invalid-email');
        await page.locator(SELECTORS.recovery.heading).click(); // blur

        const error = page.locator(SELECTORS.recovery.emailError).first();
        await expect(error).toBeVisible();
        await expect(error).toContainText('Please enter a valid email address');
    });

    test('shows success message on submit', async ({page}) => {
        await page.locator(SELECTORS.recovery.inputEmail).fill('test@example.com');
        // Both button and form submit work, but clicking button is more explicit
        await page.locator(SELECTORS.recovery.submit).click();

        const success = page.locator(SELECTORS.recovery.successMessage).first();
        // Wait for it to be visible. Increased timeout just in case.
        await success.waitFor({state: 'visible', timeout: 15000});
        await expect(success).toContainText('A link to restore your password has been sent');
    });
});
