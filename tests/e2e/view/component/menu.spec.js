/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

test.describe('Menu - e2e', () => {
    test.beforeEach(async ({page}) => {
        // make the app behave as if user is already logged in
        const fakeUser = {
            id: 1,
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

        // mock /user/data so fetch-based flow also receives same data
        await page.route('**/user/data', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(fakeUser)
            })
        );

        // mock avatar endpoint to avoid 404 noise
        const tinyPng =
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
        await page.route('**/user/avatar/**', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: Buffer.from(tinyPng, 'base64')
            })
        );
    });

    test('menu visible and avatar popup opens (robust)', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});

        const menuLocator = page.locator('.menu-container').first();

        try {
            // wait for element attached, scroll into view and then expect visible
            await menuLocator.waitFor({state: 'attached', timeout: DEFAULT_WAIT});
            await menuLocator.scrollIntoViewIfNeeded();
            await expect(menuLocator).toBeVisible({timeout: DEFAULT_WAIT});

            // sanity checks and interactions
            const games = page.getByText('Games', {exact: false});
            await expect(games).toBeVisible({timeout: DEFAULT_WAIT});

            await games.click();
            const achievements = page.getByText('Achievements', {exact: false});
            await achievements.click();

            await page.click('[data-testid="avatar-container"]');
            await page.waitForSelector('.popup-menu', {state: 'visible', timeout: DEFAULT_WAIT});

            await expect(page.getByTestId('change-avatar')).toBeVisible({timeout: DEFAULT_WAIT});
            await expect(page.getByTestId('logout')).toBeVisible({timeout: DEFAULT_WAIT});
        } catch (err) {
            await page.screenshot({path: 'playwright-debug-menu.png', fullPage: true}).catch(() => null);
            console.log('--- PAGE HTML START ---');
            console.log(await page.content());
            console.log('--- PAGE HTML END ---');
            throw err;
        }
    });
});
