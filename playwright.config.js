import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://milkyway.test/nebula/app/',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        // self-signed certificate (Not secure)
        ignoreHTTPSErrors: !!process.env.PLAYWRIGHT_IGNORE_HTTPS || true,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }, // or { channel: 'firefox' }
        },
    ],

});
