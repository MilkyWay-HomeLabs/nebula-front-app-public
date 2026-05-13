/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

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
            volumeMaster: 80,
            volumeMusic: 60,
            volumeEffects: 70,
            volumeVoices: 50
        }
    }
};

const tinyPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

async function openProfileSettings(page) {
    const menuLocator = page.locator('.menu-container').first();
    await menuLocator.waitFor({state: 'attached', timeout: DEFAULT_WAIT});
    await menuLocator.scrollIntoViewIfNeeded();
    await expect(menuLocator).toBeVisible({timeout: DEFAULT_WAIT});

    try {
        // Navigate via top menu item (no popup entry for settings exists)
        const settingsMenuItem = page.locator('.menu-item').filter({hasText: 'User Settings'}).first();
        await expect(settingsMenuItem).toBeVisible({timeout: DEFAULT_WAIT});
        await settingsMenuItem.click();

        await page.waitForSelector('[data-testid="profile-settings-form"]', {
            state: 'visible',
            timeout: DEFAULT_WAIT
        });
    } catch (err) {
        await page.screenshot({path: 'playwright-debug-profile-settings.png', fullPage: true}).catch(() => null);
        console.log('--- PAGE HTML ---');
        console.log(await page.content());
        console.log('--- END HTML ---');
        throw err;
    }
}

test.describe('Profile Settings E2E', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript((data) => {
            try {
                localStorage.setItem('userData', JSON.stringify(data));
                localStorage.setItem('authToken', 'fake-jwt-token');
            } catch (e) {
            }
        }, FAKE_USER);

        await page.route('**/user/data', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_USER)
            })
        );

        await page.route('**/nebula/avatars/**', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: Buffer.from(tinyPng, 'base64')
            })
        );

        await page.route('**/themes', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {id: 17, name: 'Default'},
                    {id: 18, name: 'Dark'}
                ])
            })
        );

        await page.route('**/users/settings', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(true)
            })
        );

        // Mock user data refresh called after successful save
        await page.route('**/users', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_USER)
            })
        );
    });

    test('opens profile settings view and displays form', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileSettings(page);

        await expect(page.locator('[data-testid="profile-settings-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="range-volumeMaster"]')).toBeVisible();
        await expect(page.locator('[data-testid="range-volumeMusic"]')).toBeVisible();
        await expect(page.locator('[data-testid="range-volumeEffects"]')).toBeVisible();
        await expect(page.locator('[data-testid="range-volumeVoices"]')).toBeVisible();
        await expect(page.locator('[data-testid="checkbox-battle-cry"]')).toBeVisible();
        await expect(page.locator('[data-testid="checkbox-muted"]')).toBeVisible();
        await expect(page.locator('[data-testid="save-settings-button"]')).toBeVisible();
    });

    test('toggles muted checkbox', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileSettings(page);

        const checkbox = page.locator('[data-testid="checkbox-muted"]');
        await expect(checkbox).not.toBeChecked();
        await checkbox.click();
        await expect(checkbox).toBeChecked();
    });

    test('saves settings and shows success dialog', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileSettings(page);

        const dialogPromise = page.waitForEvent('dialog');
        await page.locator('[data-testid="save-settings-button"]').click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Profile data updated');
        await dialog.accept();
    });

    test('shows error dialog when API request fails', async ({page}) => {
        await page.unroute('**/users/settings');
        await page.route('**/users/settings', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify(false)
            })
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileSettings(page);

        const dialogPromise = page.waitForEvent('dialog');
        await page.locator('[data-testid="save-settings-button"]').click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Something is wrong...');
        await dialog.accept();
    });
});