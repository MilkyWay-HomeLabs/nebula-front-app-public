/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

const FAKE_USER = {
    id: 1,
    login: 'e2e_user',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '1990-01-15',
    nationality: {id: 180, name: 'Poland', code: 'POL'},
    gender: {id: 1, name: 'Male'},
    games: [],
    achievements: []
};

const tinyPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

async function openProfileEditor(page) {
    const menuLocator = page.locator('.menu-container').first();
    await menuLocator.waitFor({state: 'attached', timeout: DEFAULT_WAIT});
    await menuLocator.scrollIntoViewIfNeeded();
    await expect(menuLocator).toBeVisible({timeout: DEFAULT_WAIT});

    try {
        // Navigate via top menu item
        const editorMenuItem = page.locator('.menu-item').filter({hasText: 'Profile Editor'}).first();
        await expect(editorMenuItem).toBeVisible({timeout: DEFAULT_WAIT});
        await editorMenuItem.click();

        await page.waitForSelector('[data-testid="profile-editor-form"]', {
            state: 'visible',
            timeout: DEFAULT_WAIT
        });
    } catch (err) {
        await page.screenshot({path: 'playwright-debug-profile-editor.png', fullPage: true}).catch(() => null);
        console.log('--- PAGE HTML ---');
        console.log(await page.content());
        console.log('--- END HTML ---');
        throw err;
    }
}

test.describe('Profile Editor E2E', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript((data) => {
            try {
                localStorage.setItem('userData', JSON.stringify(data));
                localStorage.setItem('authToken', 'fake-jwt-token');
            } catch (e) {}
        }, FAKE_USER);

        await page.route('**/user/data', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_USER)
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
            route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: Buffer.from(tinyPng, 'base64')
            })
        );

        await page.route('**/nationalities', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {id: 180, name: 'Poland', code: 'POL'},
                    {id: 82, name: 'Germany', code: 'DEU'}
                ])
            })
        );

        await page.route('**/genders', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {id: 1, name: 'Male'},
                    {id: 2, name: 'Female'},
                    {id: 3, name: 'Unknown'}
                ])
            })
        );

        await page.route('**/users/profile', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true})
            })
        );
    });

    test('opens profile editor and displays form with user data', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileEditor(page);

        await expect(page.locator('[data-testid="input-username"]')).toHaveValue('e2e_user');
        await expect(page.locator('[data-testid="input-email"]')).toHaveValue('test@example.com');
        await expect(page.locator('[data-testid="input-first-name"]')).toHaveValue('John');
        await expect(page.locator('[data-testid="input-last-name"]')).toHaveValue('Doe');
        await expect(page.locator('[data-testid="input-birthdate"]')).toHaveValue('1990-01-15');
    });

    test('username and email inputs are disabled', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileEditor(page);

        await expect(page.locator('[data-testid="input-username"]')).toBeDisabled();
        await expect(page.locator('[data-testid="input-email"]')).toBeDisabled();
    });

    test('saves profile and shows success dialog', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileEditor(page);

        const dialogPromise = page.waitForEvent('dialog');
        await page.locator('[data-testid="save-changes-button"]').click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Profile data updated');
        await dialog.accept();
    });

    test('shows error dialog when API request fails', async ({page}) => {
        await page.unroute('**/users/profile');
        await page.route('**/users/profile', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({success: false})
            })
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openProfileEditor(page);

        const dialogPromise = page.waitForEvent('dialog');
        await page.locator('[data-testid="save-changes-button"]').click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Failed to update profile');
        await dialog.accept();
    });
});
