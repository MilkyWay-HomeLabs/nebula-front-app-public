export const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://milkyway.test/nebula/app/';
export const DEFAULT_WAIT = 15000;

export const SELECTORS = {
    heading: '[data-e2e="login-heading"], [data-e2e="registration-heading"], [data-e2e="recovery-heading"], h1',
    login: {
        heading: '[data-e2e="login-heading"]',
        form: '[data-e2e="login-form"]',
        registerPrompt: '[data-e2e="register-prompt"]',
        recoveryPrompt: '[data-e2e="recovery-prompt"]',
        inputUsername: '[data-e2e="input-username"]',
        inputPassword: '[data-e2e="input-password"]',
        submit: '[data-e2e="submit-login"]',
        usernameError: '[data-e2e="username-error"]',
        passwordError: '[data-e2e="password-error"]',
        error: '[data-e2e="login-error"]',
        passwordToggle: '[data-e2e="password-toggle"]',
    },
    registration: {
        heading: '[data-e2e="registration-heading"]',
        loginLink: '[data-e2e="link-login"]',
        recoveryLink: '[data-e2e="link-recovery"]',
        submit: '[data-e2e="submit-register"], button[type="submit"]',
        inputLogin: '[data-e2e="input-login"]',
        loginError: '[data-e2e="login-error"]',
        passwordInput: '[data-e2e="input-password"]',
        passwordToggle: '[data-e2e="password-toggle"]',
    },
    recovery: {
        heading: '[data-e2e="recovery-heading"]',
        loginWrapper: '[data-e2e="link-login-wrapper"]',
        registerWrapper: '[data-e2e="link-register-wrapper"]',
        inputEmail: '[data-e2e="input-recovery-email"]',
        submit: '[data-e2e="recovery-submit"]',
        successMessage: '[data-e2e="recovery-success"]',
        emailError: '[data-e2e="recovery-email-error"]',
    }
};

/**
 * Click an element by data-e2e attribute, with smart child clicking for RenderLinks.
 */
export async function clickE2E(page, attr, {timeout = 8000} = {}) {
    const sel = `[data-e2e="${attr}"]`;
    const el = page.locator(sel).first();
    await el.waitFor({state: 'visible', timeout});

    // If it's a wrapper with a clickable child (like RenderLink), click the child
    const child = el.locator('.span-link, a, button').first();
    if (await child.count() > 0) {
        await child.click();
    } else {
        await el.click();
    }
}

export async function getHeadingText(page) {
    const loc = page.locator(SELECTORS.heading).first();
    try {
        await loc.waitFor({state: 'visible', timeout: 5000});
        return (await loc.textContent()).trim();
    } catch {
        return '';
    }
}
