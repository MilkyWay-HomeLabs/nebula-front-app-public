import LoginUserRequest from "../../api/account/LoginUserRequest";
import UserDataRequest from "../../api/user/UserDataRequest";
import UserData from "../../data/UserData";

/**
 * Handles user login and redirects to the specified destination or home page.
 * If a destination is provided and matches an enabled game, it redirects to the game's URL.
 *
 * @param {Object} userLoginData - The user login credentials.
 * @param {Array} games - List of available games for redirection (public/default).
 * @param {string} destination - The name of the game to redirect to after login.
 * @param {Function} navigate - Navigation function from react-router-dom.
 * @param {Function} setLoginError - State setter function for login error status.
 * @returns {Promise<void>}
 */
export const handleUserLogin = async (userLoginData, games, destination, navigate, setLoginError) => {
    try {
        const data = await LoginUserRequest(userLoginData);
        if (data && data.success === true) {
            // Andromeda is cookie-based (httpOnly): the login response sets the auth
            // cookie server-side, so there is no token to persist client-side.

            // Fetch user-specific games
            let userData = null;
            try {
                // Ensure we use the latest token for UserDataRequest
                userData = await UserDataRequest();
                if (userData) {
                    await UserData.saveUserData(userData);
                }
            } catch (err) {
                console.error("Failed to fetch userData after login:", err);
            }
            const userGames = userData?.games || [];

            const redirected = performRedirection(userGames, games, destination, navigate);
            if (!redirected) {
                if (!destination) {
                    navigate('/', { replace: true });
                } else {
                    // If destination was provided but no match found, don't navigate away.
                    // The Redirect component will stop loading and show the login form again.
                    // Or we could show an error.
                }
            }
            return; // Explicitly return to avoid any further execution
        } else {
            setLoginError(true);
            return; // Added return here as well for consistency
        }
    } catch (error) {
        console.error("Login process failed:", error);
        setLoginError(true);
    }
};

/**
 * Performs redirection based on available games and destination.
 *
 * @param {Array} userGames - List of games from user profile.
 * @param {Array} publicGames - List of public/enabled games.
 * @param {string} destination - The name of the game to redirect to.
 * @param {Function} navigate - Navigation function.
 * @returns {boolean} - True if redirection to external URL was initiated.
 */
export const performRedirection = (userGames, publicGames, destination, navigate) => {
    if (!destination) return false;

    // Try to find the destination game in user's games first
    let gameToRedirect = userGames?.find(game => game.name?.toLowerCase() === destination?.toLowerCase());

    // Fallback to public/enabled games if not found in user's games
    if (!gameToRedirect) {
        gameToRedirect = publicGames?.find(game => game.name?.toLowerCase() === destination?.toLowerCase());
    }

    if (gameToRedirect?.pageUrl) {
        // Debug: log selected redirect target
        // eslint-disable-next-line no-console
        console.debug('performRedirection: redirecting to', gameToRedirect.pageUrl, 'from destination', destination);
        // Try several navigation strategies to ensure test runners and browsers
        // perform the redirect. We first try assign, then fallback to href,
        // replace, open and finally a programmatic anchor click.
        // eslint-disable-next-line no-console
        console.debug('performRedirection: attempting navigation strategies for', gameToRedirect.pageUrl);
        // Try to synchronously set href first so unit tests that stub window.location
        // observe the change immediately. This also works in browsers.
        try {
            window.location.href = gameToRedirect.pageUrl;
        } catch (e) {
            // ignore
        }

        // Then attempt assign/replace/open as robust navigation strategies.
        try {
            if (typeof window.location.assign === 'function') window.location.assign(gameToRedirect.pageUrl);
        } catch (e) {
            // ignore and continue to next strategies
        }

        // small timeout to let assign/replace take effect in normal browsers/tests
        setTimeout(() => {
            try { if (typeof window.location.replace === 'function') window.location.replace(gameToRedirect.pageUrl); } catch (_) {}
            try { window.open(gameToRedirect.pageUrl, '_self'); } catch (_) {}
            try {
                const a = document.createElement('a');
                a.href = gameToRedirect.pageUrl;
                a.target = '_self';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
            } catch (_) {}
        }, 20);
        return true;
    }

    return false;
};