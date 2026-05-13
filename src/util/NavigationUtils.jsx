/**
 * Navigation utility constants and helper components for consistent link rendering.
 */
export const NAVIGATE_REGISTER = 'register';
export const NAVIGATE_RECOVERY = 'recovery';
export const NAVIGATE_LOGIN = 'login';

export const MESSAGE_HEADER_CONFIRMATION = "Thank you for signing up. To complete the process, click on the link sent to your email during the registration.";
export const MESSAGE_RECOVERY_SUCCESS = "A link to restore your password has been sent to the email address you provided.";

export const MESSAGE_REGISTER_PROMPT = "Don't have an account?";
export const MESSAGE_RECOVERY_PROMPT = "Forgot password?";
export const MESSAGE_LOGIN_PROMPT = "Already have an account?";

export const ERROR_INVALID_EMAIL = "It is not a valid email address: ";

/**
 * Triggers a navigation callback with the specified page identifier.
 *
 * @param {Function} onNavigate - The navigation handler function.
 * @param {string} page - The destination page identifier.
 */
export const handleNavigate = (onNavigate, page) => {
    if (typeof onNavigate === 'function') {
        onNavigate(page);
    }
};

/**
 * A reusable link component that triggers the onNavigate callback.
 *
 * @param {Object} props
 * @param {string} props.text - The link text to display.
 * @param {string} props.page - The destination page identifier.
 * @param {Function} props.onNavigate - The navigation handler function.
 */
export const RenderLink = ({ text, page, onNavigate }) => (
    <span className="span-link" onClick={() => handleNavigate(onNavigate, page)}>
        {text}
    </span>
);
