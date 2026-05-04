// tools/playwright-open-ignore-https.mjs
import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--ignore-certificate-errors']
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();
  await page.goto('https://milkyway.test/nebula/app/', { waitUntil: 'load', timeout: 60000 });
  console.log('Opened page. Playwright Inspector is active. Use the inspector to interact/record.');
  await page.pause(); // opens inspector / recorder
  // When finished, close the browser manually or Ctrl+C to stop the script.
})();
