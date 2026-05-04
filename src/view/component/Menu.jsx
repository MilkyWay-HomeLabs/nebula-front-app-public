import React, {useEffect, useRef, useState} from 'react';

import '../../resources/styles/Themes.css';
import '../../resources/styles/Menu.css';
import games from '../../resources/icon/menu/games.png';
import achievements from '../../resources/icon/menu/achievements.png';
import profileEditor from '../../resources/icon/menu/profileEditor.png';
import profileSettings from '../../resources/icon/menu/profileSettings.png';
import AvatarComponent from "./AvatarComponent.jsx";
import UserData from "../../data/UserData";
import themeListenerSingletonInstance from "../../singles/ThemeListenerSingleton";
import {processAndUploadImage} from "../../util/ImageUploaderUtils";
import {assetUrl} from "../../util/AssetUrl.js";

const logo = assetUrl('favicon.svg');

/**
 * Represents a Menu component used for navigation and user interactions within the application.
 *
 * @param {Object} props - Props passed to the component.
 * @param {Function} props.onNavigate - A callback function that navigates to a primary route or page.
 * @param {Function} props.onSubNavigate - A callback function that navigates to a secondary or sub-route.
 *
 * @returns {JSX.Element} A structured menu interface containing navigation options and user avatar functionality.
 *
 * The Menu component handles:
 * - Theme switching by observing a theme listener singleton.
 * - Navigation to different routes upon interaction with menu items.
 * - User avatar interactions, such as changing avatar or accessing profile-related actions.
 * - Uploading and processing user avatar images.
 */
const Menu = ({onNavigate, onSubNavigate}) => {

    const [theme, setTheme] = useState('Default');

    const handleThemeUpdate = async () => {
        try {
            const themeName = await UserData.getThemeName();
            setTheme(themeName || 'Default');
        } catch (error) {
            console.error('Error in handleThemeUpdate:', error);
            setTheme('Default');
        }
    };
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const theme = await UserData.getThemeName();
                setTheme(theme);
            } catch (error) {
                console.error('Failed to load theme:', error);
                setTheme('Default');
            }
        };

        fetchTheme().then(_ => {
        });

        themeListenerSingletonInstance.addObserver(handleThemeUpdate);
        return () => {
            themeListenerSingletonInstance.removeObserver(handleThemeUpdate);
        };
    }, []);

    const [isMenuOpen, setMenuOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        setMenuOpen(!isMenuOpen);
    };

    const handleMenuItemClick = (action) => {
        if (action === 'passwordChange') {
            onSubNavigate('passwordChange');
        } else if (action === 'logout') {
            onNavigate('logout');
        } else if (action === 'achievements') {
            onSubNavigate('achievements');
        } else if (action === 'games') {
            onSubNavigate('games');
        } else if (action === 'profileSettings') {
            onSubNavigate('profileSettings');
        } else if (action === 'profileEditor') {
            onSubNavigate('profileEditor');
        }
        setMenuOpen(false);
    };

    const handleAvatarChange = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) await processAndUploadImage(file);
    };

    return (
        <div className="menu-container" data-theme={theme} data-testid="menu-container">
            <div className="left-section">
                <img src={logo} className="Menu-logo" alt="logo"/>
            </div>
            <div className="menu-items">
                <div className="menu-items">
                    <div className="menu-item" onClick={() => handleMenuItemClick('games')}>
                        <img src={games} alt="Games"/>
                        <span>Games</span>
                    </div>
                    <div className="menu-item" onClick={() => handleMenuItemClick('profileEditor')}>
                        <img src={profileEditor} alt="Profile Edit"/>
                        <span>Profile Editor</span>
                    </div>
                    <div className="menu-item" onClick={() => handleMenuItemClick('profileSettings')}>
                        <img src={profileSettings} alt="Settings"/>
                        <span>User Settings</span>
                    </div>
                    <div className="menu-item" onClick={() => handleMenuItemClick('achievements')}>
                        <img src={achievements} alt="Achievements"/>
                        <span>Achievements</span>
                    </div>
                </div>
            </div>
            <div className="right-section">
                <div className="avatar-container" onClick={handleAvatarClick} data-testid="avatar-container">
                    <AvatarComponent width="64px" height="64px"/>
                    {isMenuOpen && (
                        <div className="popup-menu">
                            <div data-testid="change-avatar" onClick={handleAvatarChange}>Change Avatar</div>
                            <div data-testid="profile" onClick={() => handleMenuItemClick('profileEditor')}>Profile
                            </div>
                            <div data-testid="password" onClick={() => handleMenuItemClick('passwordChange')}>Password
                            </div>
                            <div data-testid="logout" onClick={() => handleMenuItemClick('logout')}>Log out</div>
                        </div>
                    )}
                </div>
            </div>
            <input
                type="file"
                accept="image/*"
                style={{display: 'none'}}
                ref={fileInputRef}
                onChange={handleFileUpload}
                data-testid="avatar-file-input"
            />
        </div>
    );
};

export default Menu;
