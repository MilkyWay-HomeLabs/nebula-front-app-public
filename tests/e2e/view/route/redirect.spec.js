/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT, SELECTORS} from '../../helpers';

test.describe('Redirect E2E', () => {
    test('redirects to external game after successful login with destination', async ({page}) => {
        const games = [{name: 'mygame', pageUrl: 'https://milkyway.test/mygame/app/'}];

        // Mock games enabled endpoint
        await page.route('**/api/v1/games/enabled', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(games)
            });
        });

        // Mock login request
        await page.route('**/account/token', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, data: {token: 'fake-jwt-token'}})
            });
        });

        // Access the app with destination parameter - using /redirect path
        await page.goto(`${BASE}redirect?destination=mygame`, {waitUntil: 'networkidle', timeout: 60000});

        // Wait for login form
        await page.locator(SELECTORS.login.inputUsername).waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        // Perform login
        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');

        // We expect redirection after clicking login
        const loginButton = page.locator(SELECTORS.login.submit);
        await loginButton.click();

        // Check if browser navigated to external URL
        await expect(page).toHaveURL('https://milkyway.test/mygame/app/', {timeout: DEFAULT_WAIT});
    });

    test('redirects to home page after successful login without destination', async ({page}) => {
        // Mock games enabled endpoint
        await page.route('**/nebula-rest-api/api/v1/games/enabled', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            })
        );

        // Mock login request - updated to match the wrapper's success structure
        await page.route('**/account/token', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, data: {token: 'fake-jwt-token'}})
            })
        );

        // Mock user data fetch (needed for Home page)
        await page.route('**/users', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({id: 1, login: 'testuser', settings: {general: {theme: {id: 1, name: 'Default'}}}})
            })
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});

        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');
        await page.locator(SELECTORS.login.submit).click();

        // Should land on home page (which has menu)
        await expect(page.locator('[data-testid="menu-container"]')).toBeVisible({timeout: DEFAULT_WAIT});
    });
});
