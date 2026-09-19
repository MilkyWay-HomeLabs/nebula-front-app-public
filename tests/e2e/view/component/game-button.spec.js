/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT} from '../../helpers';

test.describe('GameButton - e2e', () => {
    test.beforeEach(async ({page, context}) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err));

        // Make page behave as if user is already logged in by setting localStorage before load.
        await page.addInitScript(() => {
            const fakeUser = {
                id: 1,
                login: 'testuser',
                games: [
                    {id: 1, name: 'E2EGame', iconUrl: '/icons/e2e.svg', enable: true, pageUrl: '/nebula/app/e2e-target'}
                ],
                settings: {}
            };
            try {
                localStorage.setItem('authToken', 'fake-jwt-token');
                localStorage.setItem('userData', JSON.stringify(fakeUser));
            } catch (e) {
                // ignore in case storage is not available in some envs
            }

            // navigation capture helper
            window.__navigatedTo = null;
            try {
                const originalLocation = window.location;
                Object.defineProperty(window, 'location', {
                    configurable: true,
                    enumerable: true,
                    value: {
                        set href(url) {
                            window.__navigatedTo = url;
                        },
                        get href() {
                            return window.__navigatedTo || originalLocation.href;
                        },
                        assign(url) {
                            window.__navigatedTo = url;
                        },
                        replace(url) {
                            window.__navigatedTo = url;
                        },
                    }
                });
            } catch (e) {
                window.__navigatedTo = window.__navigatedTo || null;
            }
            (function () {
                const origPush = history.pushState;
                history.pushState = function (state, title, url) {
                    if (url) window.__navigatedTo = url;
                    return origPush.apply(this, arguments);
                };
                const origReplace = history.replaceState;
                history.replaceState = function (state, title, url) {
                    if (url) window.__navigatedTo = url;
                    return origReplace.apply(this, arguments);
                };
            })();
        });

        // add optional cookie if backend expects cookie-based session (doesn't hurt)
        await context.addCookies([{
            name: 'test_cookie',
            value: '1',
            domain: 'milkyway.test',
            path: '/',
            httpOnly: true,
            secure: true
        }]);

        // Mock avatar requests to avoid 404 noise (tiny transparent PNG)
        const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
        await page.route('**/user/avatar/**', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: Buffer.from(tinyPng, 'base64')
            });
        });

        // Provide a target page so navigation would not 404 if it happens
        await page.route('**/nebula/app/e2e-target', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<html><body><h1>Target</h1></body></html>'
            });
        });

        // Optional: still mock user/data and token endpoints as safe-guard
        await page.route('**/account/token', (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({success: true, token: 'fake-jwt-token'})
        }));
        await page.route('**/user/data', (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 1,
                login: 'testuser',
                games: [
                    {id: 1, name: 'E2EGame', iconUrl: '/icons/e2e.svg', enable: true, pageUrl: '/nebula/app/e2e-target'}
                ]
            })
        }));
    });

    test('session restored and clicking game triggers navigation attempt', async ({page}) => {
        // navigate to the SPA (we've already injected localStorage values)
        await page.goto(BASE, {waitUntil: 'load', timeout: 60000});

        // wait for games container that should be present when session restored
        await page.waitForSelector('[data-testid="game-container"]', {state: 'visible', timeout: DEFAULT_WAIT});

        // increase viewport to avoid off-screen issues
        await page.setViewportSize({width: 1280, height: 1600});

        // locate game button by class + text
        const button = page.locator('.game-button', {hasText: 'E2EGame'}).first();

        try {
            await button.waitFor({state: 'attached', timeout: DEFAULT_WAIT});
            await button.scrollIntoViewIfNeeded();
            await button.waitFor({state: 'visible', timeout: DEFAULT_WAIT});

            const disabled = await button.getAttribute('disabled');
            if (disabled !== null) {
                throw new Error('Found game button but it is disabled');
            }

            await button.click({timeout: DEFAULT_WAIT});

            // wait for navigation or target content and assert target page rendered
            // waitForURL sometimes fails in SPA setups; use both URL check and visible content
            await page.waitForTimeout(200); // small delay to let navigation start if any
            try {
                await page.waitForURL('**/e2e-target', {timeout: DEFAULT_WAIT});
            } catch (e) {
                // ignore if URL pattern did not change (SPA with same base), we'll assert by content
            }
            await page.waitForSelector('h1', {state: 'visible', timeout: DEFAULT_WAIT});
            await expect(page.locator('h1')).toContainText('Target');
            expect(page.url()).toContain('/e2e-target');
        } catch (err) {
            // debug artifacts
            await page.screenshot({path: 'playwright-debug-game-button.png', fullPage: true}).catch(() => null);
            console.log('--- PAGE HTML START ---');
            console.log(await page.content());
            console.log('--- PAGE HTML END ---');
            throw err;
        }
    });
});
