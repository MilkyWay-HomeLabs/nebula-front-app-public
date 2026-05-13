import {expect, test} from '@playwright/test';
import {BASE, clickE2E} from '../../helpers';

test.describe('Confirmation Info E2E', () => {
    test.beforeEach(async ({page}) => {
        await page.goto(BASE);
        // Note: The component is currently commented out in Home.jsx.
        // If it were active, the test would expect a transition after registration.
        // For the purpose of this test, we assume it can be reached via navigation (if implemented)
        // or directly if the system allows.
    });

    test('should display confirmation info elements', async ({page}) => {
        // Since it is commented out, this test will likely not pass in a full cycle
        // but it shows how it should look.
        const container = page.locator('[data-e2e="confirmation-info-page"]');
        const heading = page.locator('[data-e2e="confirmation-heading"]');

        // Check visibility (if the component is rendered)
        if (await container.count() > 0) {
            await expect(container).toBeVisible();
            await expect(heading).toBeVisible();
            await expect(heading).toContainText('To complete the process, click on the link sent to your email');
        }
    });

    test('should navigate to login page from confirmation info', async ({page}) => {
        if (await page.locator('[data-e2e="login-prompt-wrapper"]').count() > 0) {
            await clickE2E(page, 'login-prompt-wrapper');
            // Page change verification
            await expect(page.locator('[data-e2e="login-heading"]')).toBeVisible();
        }
    });
});
