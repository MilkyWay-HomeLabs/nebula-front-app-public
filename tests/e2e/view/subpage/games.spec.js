/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

test.describe('Games - e2e', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => {
            const fake = {
                id: 1,
                login: 'testuser',
                games: [
                    {id: 1, name: 'E2EGame', iconUrl: '/icons/e2e.svg', enable: true, pageUrl: '/nebula/app/e2e-target'}
                ]
            };
            localStorage.setItem('userData', JSON.stringify(fake));
            localStorage.setItem('authToken', 'fake-jwt-token');
        });

        const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
        await page.route('**/user/avatar/**', (route) => {
            route.fulfill({status: 200, contentType: 'image/png', body: Buffer.from(tinyPng, 'base64')});
        });
        await page.route('**/nebula/app/e2e-target', (route) => {
            route.fulfill({status: 200, contentType: 'text/html', body: '<html><body><h1>Target</h1></body></html>'});
        });
    });

    test('games render from localStorage and clicking navigates to target', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'load'});
        await page.waitForSelector('[data-testid="game-container"]', {state: 'visible', timeout: DEFAULT_WAIT});

        // find the rendered game button
        const btn = page.locator('.game-button', {hasText: 'E2EGame'}).first();
        await btn.waitFor({state: 'visible', timeout: DEFAULT_WAIT});
        await btn.click();
        // wait for target content
        await page.waitForSelector('h1', {state: 'visible', timeout: DEFAULT_WAIT});
        await expect(page.locator('h1')).toContainText('Target');
    });
});