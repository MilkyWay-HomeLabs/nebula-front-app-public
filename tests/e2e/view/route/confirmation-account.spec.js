/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

const CONFIRM_URL = (id, token) => `${BASE}confirm/${id}/${token}`;

test.describe('ConfirmationAccount E2E', () => {
    test('displays confirmation page with id and truncated token', async ({page}) => {
        const longToken = 'ABCDEFGHIJ_MIDDLE_IGNORED_KLMNOPQRST';

        await page.route('**/account/confirm', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true})
            })
        );

        await page.goto(CONFIRM_URL('42', longToken), {waitUntil: 'domcontentloaded', timeout: 60000});

        await expect(page.getByText(/Account confirmation/i)).toBeVisible({timeout: DEFAULT_WAIT});
        await expect(page.getByText(/ID: 42/)).toBeVisible();
        await expect(page.getByText(/ABCDEFGHIJ\.\.\.KLMNOPQRST/)).toBeVisible();
        await expect(page.getByRole('button', {name: /Confirm Account/i})).toBeVisible();
    });

    test('shows success alert after clicking confirm', async ({page}) => {
        await page.route('**/account/confirm', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true})
            })
        );

        await page.goto(CONFIRM_URL('7', 'validtoken123'), {waitUntil: 'domcontentloaded', timeout: 60000});

        await expect(page.getByRole('button', {name: /Confirm Account/i})).toBeVisible({timeout: DEFAULT_WAIT});

        const dialogPromise = page.waitForEvent('dialog');
        await page.getByRole('button', {name: /Confirm Account/i}).click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('The account has been confirmed');
        await dialog.accept();
    });

    test('shows failure alert when API returns unsuccessful result', async ({page}) => {
        await page.route('**/account/confirm', (route) =>
            route.fulfill({
                status: 400,
                contentType: 'text/plain',
                body: 'Token expired'
            })
        );

        await page.goto(CONFIRM_URL('5', 'expiredtoken'), {waitUntil: 'domcontentloaded', timeout: 60000});

        await expect(page.getByRole('button', {name: /Confirm Account/i})).toBeVisible({timeout: DEFAULT_WAIT});

        const dialogPromise = page.waitForEvent('dialog');
        await page.getByRole('button', {name: /Confirm Account/i}).click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Confirmation failed: Token expired');
        await dialog.accept();
    });

    test('shows error alert when API request fails', async ({page}) => {
        await page.route('**/account/confirm', (route) =>
            route.abort('failed')
        );

        await page.goto(CONFIRM_URL('3', 'sometoken'), {waitUntil: 'domcontentloaded', timeout: 60000});

        await expect(page.getByRole('button', {name: /Confirm Account/i})).toBeVisible({timeout: DEFAULT_WAIT});

        const dialogPromise = page.waitForEvent('dialog');
        await page.getByRole('button', {name: /Confirm Account/i}).click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Confirmation failed:');
        await dialog.accept();
    });
});
