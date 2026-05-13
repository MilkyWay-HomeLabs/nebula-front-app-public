import React, {useEffect, useState} from 'react';
import '../../resources/styles/Main.css';

import '../../resources/styles/Games.css';
import UserData from '../../data/UserData';
import GameButton from '../component/GameButton.jsx';
import themeListenerSingletonInstance from "../../singles/ThemeListenerSingleton";

const DEFAULT_THEME = 'Default';

/**
 * Represents a functional component that manages game-related data, theme settings, and rendering game buttons.
 *
 * This component initializes and handles:
 * - Theme management with a listener to dynamically update the app's theme.
 * - Retrieval and setting of user data, including games information.
 * - Dynamically rendering a list of game-related buttons based on the user's data.
 *
 * State Variables:
 * - `theme`: The currently selected theme of the application.
 * - `games`: List of games associated with the user's data.
 * - `userData`: Complete user data retrieved from a data source.
 *
 * Effects:
 * - Initializes and manages the theme listener when the component mounts.
 * - Loads user data asynchronously after the component mounts.
 * - Updates the games state whenever user data (`userData`) changes.
 *
 * Returns:
 * - A React component that renders a list of `GameButton` components inside a container, styled based on the selected theme.
 */
const Games = () => {
    const [theme, setTheme] = useState(UserData.getThemeName() || DEFAULT_THEME);
    const [games, setGames] = useState([]);
    const [userData, setUserData] = useState();

    const initializeThemeListener = () => {
        const updateTheme = async () => {
            setTheme(await UserData.getThemeName() || DEFAULT_THEME);
        };
        themeListenerSingletonInstance.addObserver(updateTheme);

        return () => {
            themeListenerSingletonInstance.removeObserver(updateTheme);
        };
    };

    const loadUserData = async () => {
        try {
            const data = await UserData.loadUserData();
            setUserData(data);
        } catch (error) {
            console.error('Error loading user data:', error);
            setUserData(null);
        }
    };

    useEffect(initializeThemeListener, []); // Theme listener
    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userData?.games) {
            setGames(userData.games);
        }
    }, [userData]);

    return (
        <div className="full-page-container" data-testid="game-container" data-theme={theme}>
            {games.map((game) => (
                <GameButton key={game.id} game={game}/>
            ))}
        </div>
    );
};

export default Games;
