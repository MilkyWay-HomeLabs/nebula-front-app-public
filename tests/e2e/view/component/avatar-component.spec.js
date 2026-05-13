/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

test.describe('AvatarComponent - e2e', () => {
    test.beforeEach(async ({page}) => {
        const fakeUser = {
            id: 123456807,
            login: 'e2e_user',
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

        // mock real avatar endpoint
        const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
        await page.route('**/resources/nebula/avatars/123456807.jpg', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: Buffer.from(tinyPng, 'base64')
            })
        );
    });

    test('renders avatar in menu', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});

        const avatar = page.locator('.avatar').first();

        await avatar.waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        await expect(avatar).toBeVisible();
        await expect(avatar).toHaveAttribute('alt', 'Avatar');
    });
});
