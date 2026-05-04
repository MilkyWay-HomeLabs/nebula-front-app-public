import LoginUserRequest from "../../api/account/LoginUserRequest";

/**
 * Handles user login and redirects to the specified destination or home page.
 * If a destination is provided and matches an enabled game, it redirects to the game's URL.
 *
 * @param {Object} userLoginData - The user login credentials.
 * @param {Array} games - List of available games for redirection.
 * @param {string} destination - The name of the game to redirect to after login.
 * @param {Function} navigate - Navigation function from react-router-dom.
 * @param {Function} setLoginError - State setter function for login error status.
 * @returns {Promise<void>}
 */
export const handleUserLogin = async (userLoginData, games, destination, navigate, setLoginError) => {
    try {
        const data = await LoginUserRequest(userLoginData);
        if (data && data.success === true) {
            const token = data.data?.token || data.token;
            if (token) {
                localStorage.setItem('authToken', token);
            }
            const gameToRedirect = games?.find(game => game.name === destination);
            if (gameToRedirect?.pageUrl) {
                window.location.href = gameToRedirect.pageUrl;
                return;
            } else {
                navigate('/');
            }
        } else {
            setLoginError(true);
        }
    } catch (error) {
        console.error("Login process failed:", error);
        setLoginError(true);
    }
};