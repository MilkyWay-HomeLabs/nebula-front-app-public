/* eslint-env node */
import {expect, test} from '@playwright/test';
import {BASE, DEFAULT_WAIT, SELECTORS} from '../../helpers';

test.describe('Redirect E2E', () => {
    test('automatically redirects using cached userData if authToken is present', async ({page}) => {
        const userGames = [{name: 'Hacman', pageUrl: 'https://milkyway.test/hacman/app/'}];

        // Mock user data fetch (even if it takes time, cached data should work)
        await page.route('**/users', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        id: 1,
                        login: 'testuser',
                        games: userGames
                    }
                })
            });
        });

        // Setup authenticated state with cached userData
        await page.addInitScript((games) => {
            localStorage.setItem('authToken', 'valid-token');
            localStorage.setItem('userData', JSON.stringify({
                id: 1,
                login: 'testuser',
                games: games
            }));
        }, userGames);

        // Access the /redirect path with destination
        await page.goto(`${BASE}redirect?destination=Hacman`, {waitUntil: 'domcontentloaded', timeout: 60000});

        // Check if browser automatically navigated to external URL
        await expect(page).toHaveURL('https://milkyway.test/hacman/app/', {timeout: DEFAULT_WAIT});
    });

    test('automatically redirects if already logged in with destination', async ({page}) => {
        const userGames = [{name: 'Hacman', pageUrl: 'https://milkyway.test/hacman/app/'}];

        // Mock user data fetch
        await page.route('**/users', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        id: 1,
                        login: 'testuser',
                        games: userGames
                    }
                })
            });
        });

        // Setup authenticated state
        await page.addInitScript(() => {
            localStorage.setItem('authToken', 'valid-token');
        });

        // Access the /redirect path with destination
        // Use domcontentloaded here to avoid waiting for background asset/network activity
        // which can make the test hang under certain CI/dev setups.
        await page.goto(`${BASE}redirect?destination=Hacman`, {waitUntil: 'domcontentloaded', timeout: 60000});

        // Check if browser automatically navigated to external URL
        await expect(page).toHaveURL('https://milkyway.test/hacman/app/', {timeout: DEFAULT_WAIT});
    });

    test('redirects to external game from userData after successful login with destination', async ({page}) => {
        const publicGames = [{name: 'publicGame', pageUrl: 'https://milkyway.test/public/app/'}];
        const userGames = [{name: 'Hacman', pageUrl: 'https://milkyway.test/hacman/app/'}];

        // Mock public games enabled endpoint
        await page.route('**/v1/games/enabled', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(publicGames)
            });
        });

        // Mock login request
        await page.route('**/account/token', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, data: {token: 'fake-jwt-token'}})
            });
        });

        // Mock user data fetch with specific games. The boot-time probe (first call,
        // made with no cached userData/authToken) must report "not authenticated" so
        // the login form renders; only the call made after the real login submit
        // below should return the user with their games.
        let usersCallCount = 0;
        await page.route('**/users', (route) => {
            usersCallCount++;
            if (usersCallCount === 1) {
                return route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({success: false, error: 'UNAUTHORIZED'})
                });
            }
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        id: 1,
                        login: 'testuser',
                        games: userGames
                    }
                })
            });
        });

        // Access the app with destination parameter - using /redirect path
        // Use domcontentloaded to avoid hanging on background network activity
        await page.goto(`${BASE}redirect?destination=Hacman`, {waitUntil: 'domcontentloaded', timeout: 60000});

        // Wait for login form
        await page.locator(SELECTORS.login.inputUsername).waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        // Perform login
        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');

        // We expect redirection after clicking login
        const loginButton = page.locator(SELECTORS.login.submit);
        await loginButton.click();

        // Check if browser navigated to external URL from userData
        await expect(page).toHaveURL('https://milkyway.test/hacman/app/', {timeout: DEFAULT_WAIT});
    });

    test('redirects to external game after successful login with destination', async ({page}) => {
        const games = [{name: 'mygame', pageUrl: 'https://milkyway.test/mygame/app/'}];

        // Mock games enabled endpoint
        await page.route('**/v1/games/enabled', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(games)
            });
        });

        // Mock login request
        await page.route('**/account/token', (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, data: {token: 'fake-jwt-token'}})
            });
        });

        // Access the app with destination parameter - using /redirect path
        // Use domcontentloaded to avoid hanging on background network activity
        await page.goto(`${BASE}redirect?destination=mygame`, {waitUntil: 'domcontentloaded', timeout: 60000});

        // Wait for login form
        await page.locator(SELECTORS.login.inputUsername).waitFor({state: 'visible', timeout: DEFAULT_WAIT});

        // Perform login
        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');

        // We expect redirection after clicking login
        const loginButton = page.locator(SELECTORS.login.submit);
        await loginButton.click();

        // Check if browser navigated to external URL
        await expect(page).toHaveURL('https://milkyway.test/mygame/app/', {timeout: DEFAULT_WAIT});
    });

    test('redirects to home page after successful login without destination', async ({page}) => {
        // Mock games enabled endpoint
        await page.route('**/v1/games/enabled', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            })
        );

        // Mock login request - updated to match the wrapper's success structure
        await page.route('**/account/token', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({success: true, data: {token: 'fake-jwt-token'}})
            })
        );

        // Mock user data fetch (needed for Home page). The boot-time probe (first
        // call, no cached session) must report "not authenticated" so the login form
        // renders; only the call made after the real login submit below should
        // return the user.
        let usersCallCount = 0;
        await page.route('**/users', (route) => {
            usersCallCount++;
            if (usersCallCount === 1) {
                return route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({success: false, error: 'UNAUTHORIZED'})
                });
            }
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({id: 1, login: 'testuser', settings: {general: {theme: {id: 1, name: 'Default'}}}})
            });
        });

        await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 60000});

        await page.locator(SELECTORS.login.inputUsername).waitFor({state: 'visible', timeout: DEFAULT_WAIT});
        await page.locator(SELECTORS.login.inputUsername).fill('test@example.com');
        await page.locator(SELECTORS.login.inputPassword).fill('StrongPass123!');
        await page.locator(SELECTORS.login.submit).click();

        // Should land on home page (which has menu)
        await expect(page.locator('[data-testid="menu-container"]')).toBeVisible({timeout: DEFAULT_WAIT});
    });
});
