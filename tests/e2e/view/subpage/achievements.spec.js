/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

test.describe('Achievements - e2e', () => {
    test.beforeEach(async ({page}) => {
        // prepare fake user data before app loads (helps app render quickly)
        const fake = {
            id: 1,
            login: 'e2e_user',
            achievements: [
                {id: 1, iconUrl: '/icons/1.svg', name: 'Total Progress', progress: '0,00%', level: 2},
                {id: 2, iconUrl: '/icons/2.svg', name: 'Chess Progress', progress: '0,00%', level: 4}
            ]
        };

        await page.addInitScript((data) => {
            try {
                localStorage.setItem('userData', JSON.stringify(data));
                localStorage.setItem('authToken', 'fake-jwt-token');
            } catch (e) {
            }
        }, fake);

        // mock user/data endpoint so both code paths are covered (localStorage or fetch)
        await page.route('**/user/data', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(fake)
            })
        );

        // mock avatar/image endpoints to avoid 404 noise
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

    test('renders achievements and verifies content without relying on data-testid', async ({page}) => {
        await page.goto(BASE, {waitUntil: 'load', timeout: 60000});

        // wait for menu container then open Achievements page
        await page.waitForSelector('[data-testid="menu-container"]', {state: 'visible', timeout: DEFAULT_WAIT});
        const menuItem = page.getByText('Achievements', {exact: false});
        await menuItem.click();

        // wait for at least one table row to appear (robust selector)
        await page.waitForSelector('table.custom-table tbody tr', {state: 'visible', timeout: DEFAULT_WAIT});

        // wait for a specific achievement label text to be visible
        await page.waitForSelector('text=Total Progress', {state: 'visible', timeout: DEFAULT_WAIT});

        // collect rows (some builds may not include data-testid)
        const rows = await page.$$('table.custom-table tbody tr');
        expect(rows.length).toBeGreaterThanOrEqual(2);

        // locate the row that contains "Total Progress"
        const totalProgressCell = page.getByText('Total Progress', {exact: false}).first();
        const totalRow = totalProgressCell.locator('xpath=ancestor::tr');

        // assert icon src inside that row
        const icon = totalRow.locator('img').first();
        expect(await icon.getAttribute('src')).toContain('/icons/1.svg');

        // count gold stars inside the row
        const goldStarsRow1 = await totalRow.locator('.gold-star').count();
        expect(goldStarsRow1).toBe(2);

        // do same for Chess Progress
        const chessCell = page.getByText('Chess Progress', {exact: false}).first();
        const chessRow = chessCell.locator('xpath=ancestor::tr');
        const goldStarsRow2 = await chessRow.locator('.gold-star').count();
        expect(goldStarsRow2).toBe(4);
    });
});