/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

async function openPasswordChange(page) {
    const menuLocator = page.locator('.menu-container').first();

    await menuLocator.waitFor({state: 'attached', timeout: DEFAULT_WAIT});
    await menuLocator.scrollIntoViewIfNeeded();
    await expect(menuLocator).toBeVisible({timeout: DEFAULT_WAIT});

    try {
        await page.click('[data-testid="avatar-container"]');
        await page.waitForSelector('.popup-menu', {state: 'visible', timeout: DEFAULT_WAIT});

        const passwordItem = page.getByTestId('password');
        await expect(passwordItem).toBeVisible({timeout: DEFAULT_WAIT});
        await passwordItem.click({force: true});

        // wait using data-testid (present in both old and new PasswordChange)
        await page.waitForSelector('[data-testid="current-password-input"]', {
            state: 'visible',
            timeout: DEFAULT_WAIT
        });
    } catch (err) {
        await page.screenshot({path: 'playwright-debug-password-change.png', fullPage: true}).catch(() => null);
        console.log('--- PAGE HTML ---');
        console.log(await page.content());
        console.log('--- END HTML ---');
        throw err;
    }
}

test.describe('Password Change E2E', () => {
    test.beforeEach(async ({page}) => {
        const fakeUser = {
            id: 1,
            login: 'e2e_user',
            email: 'test@example.com',
            games: [],
            achievements: []
        };

        await page.addInitScript((data) => {
            try {
                localStorage.setItem('userData', JSON.stringify(data));
                localStorage.setItem('authToken', 'fake-jwt-token');
            } catch (e) {
            }
        }, fakeUser);

        await page.route('**/user/data', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(fakeUser)
            })
        );

        const tinyPng =
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
        await page.route('**/nebula/avatars/**', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: Buffer.from(tinyPng, 'base64')
            })
        );

        await page.route('**/account/change-password', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true})
            })
        );
    });

    test('opens password change view and displays form', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openPasswordChange(page);

        await expect(page.locator('[data-testid="current-password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="new-password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="change-password-button"]')).toBeVisible();
    });

    test('toggles password visibility', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openPasswordChange(page);

        const newPasswordInput = page.locator('[data-testid="new-password-input"]');
        const toggle = page.getByLabel(/Show new password/i);

        await expect(newPasswordInput).toHaveAttribute('type', 'password');
        await toggle.click();
        await expect(newPasswordInput).toHaveAttribute('type', 'text');
    });

    test('shows validation message when confirmation password does not match', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openPasswordChange(page);

        await page.locator('[data-testid="current-password-input"]').fill('CurrentPass123!');
        await page.locator('[data-testid="new-password-input"]').fill('NewStrongPass123!');
        await page.locator('[data-testid="confirm-password-input"]').fill('Mismatch123!');

        await page.locator('[data-testid="change-password-button"]').click();

        await expect(page.getByText(/Passwords must match/i)).toBeVisible();
    });

    test('submits successfully and clears fields', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openPasswordChange(page);

        const currentPasswordInput = page.locator('[data-testid="current-password-input"]');
        const newPasswordInput = page.locator('[data-testid="new-password-input"]');
        const confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');

        await currentPasswordInput.fill('CurrentPass123!');
        await newPasswordInput.fill('NewStrongPass123!');
        await confirmPasswordInput.fill('NewStrongPass123!');

        const dialogPromise = page.waitForEvent('dialog');
        await page.locator('[data-testid="change-password-button"]').click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Password updated');
        await dialog.accept();

        await expect(currentPasswordInput).toHaveValue('');
        await expect(newPasswordInput).toHaveValue('');
        await expect(confirmPasswordInput).toHaveValue('');
    });

    test('shows error dialog when API request fails', async ({page}) => {
        await page.unroute('**/account/change-password');
        await page.route('**/account/change-password', (route) =>
            route.fulfill({
                status: 502,
                contentType: 'application/json',
                body: JSON.stringify({success: false, message: 'BAD_GATEWAY'})
            })
        );

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});
        await openPasswordChange(page);

        await page.locator('[data-testid="current-password-input"]').fill('CurrentPass123!');
        await page.locator('[data-testid="new-password-input"]').fill('NewStrongPass123!');
        await page.locator('[data-testid="confirm-password-input"]').fill('NewStrongPass123!');

        const dialogPromise = page.waitForEvent('dialog');
        await page.locator('[data-testid="change-password-button"]').click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Something is wrong...');
        await dialog.accept();
    });
});