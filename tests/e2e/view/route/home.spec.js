/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT, SELECTORS} from '../../helpers';

const FAKE_USER = {
    id: 1,
    login: 'e2e_user',
    email: 'test@example.com',
    games: [],
    achievements: [],
    settings: {
        general: {theme: {id: 17, name: 'Default'}},
        sound: {
            muted: false,
            battleCry: true,
            volumeMaster: 100,
            volumeMusic: 100,
            volumeEffects: 100,
            volumeVoices: 100
        }
    }
};

const tinyPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

test.describe('Home E2E', () => {
    test('shows login form on initial load when not authenticated', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await page.locator(SELECTORS.login.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        await expect(page.locator(SELECTORS.login.heading)).toContainText('Login');
        await expect(page.locator(SELECTORS.login.submit)).toBeVisible();
    });

    test('logs in and shows games subpage', async ({page}) => {
        await page.route('**/account/token', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, token: 'fake-jwt-token'})
            })
        );
        await page.route('**/users', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_USER)
            })
        );
        await page.route('**/nebula/avatars/**', (route) =>
            route.fulfill({status: 200, contentType: 'image/png', body: Buffer.from(tinyPng, 'base64')})
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await page.locator(SELECTORS.login.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');
        await page.locator(SELECTORS.login.submit).click();

        await expect(page.locator('[data-testid="menu-container"]')).toBeVisible({timeout: DEFAULT_WAIT});
        await expect(page.locator('.full-page-container')).toBeVisible({timeout: DEFAULT_WAIT});
    });

    test('restores session from localStorage and shows games', async ({page}) => {
        await page.addInitScript((data) => {
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('authToken', 'fake-jwt-token');
        }, FAKE_USER);

        await page.route('**/nebula/avatars/**', (route) =>
            route.fulfill({status: 200, contentType: 'image/png', body: Buffer.from(tinyPng, 'base64')})
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});

        await expect(page.locator('[data-testid="menu-container"]')).toBeVisible({timeout: DEFAULT_WAIT});
    });

    test('navigates to password change via avatar popup', async ({page}) => {
        await page.addInitScript((data) => {
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('authToken', 'fake-jwt-token');
        }, FAKE_USER);

        await page.route('**/nebula/avatars/**', (route) =>
            route.fulfill({status: 200, contentType: 'image/png', body: Buffer.from(tinyPng, 'base64')})
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await expect(page.locator('[data-testid="avatar-container"]')).toBeVisible({timeout: DEFAULT_WAIT});

        await page.locator('[data-testid="avatar-container"]').click();
        await page.waitForSelector('.popup-menu', {state: 'visible', timeout: DEFAULT_WAIT});
        await page.getByTestId('password').click({force: true});

        await expect(page.locator('[data-testid="password-change-form"]')).toBeVisible({timeout: DEFAULT_WAIT});
    });

    test('navigates to registration form and back to login', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await page.locator(SELECTORS.login.heading).first().waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        await page.locator('[data-e2e="register-prompt"] .span-link').click();
        await expect(page.locator(SELECTORS.registration.heading)).toBeVisible({timeout: DEFAULT_WAIT});

        await page.locator(SELECTORS.registration.loginLink).click();
        await expect(page.locator(SELECTORS.login.heading)).toBeVisible({timeout: DEFAULT_WAIT});
    });
});
