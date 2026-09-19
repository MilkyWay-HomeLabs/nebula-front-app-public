import React, {useEffect, useState} from 'react';
import '../../App.css';
import '../../resources/styles/Main.css';
import UserData from '../../data/UserData';

import LoginForm from '../page/LoginForm';
import RegistrationForm from '../page/RegistrationForm';
import ConfirmationInfo from "../page/ConfirmationInfo.jsx";
import PasswordRecovery from '../page/PasswordRecovery';

import RegistrationRequest from '../../api/account/RegistrationRequest';
import LoginUserRequest from "../../api/account/LoginUserRequest";
import UserDataRequest from "../../api/user/UserDataRequest";

import Menu from '../component/Menu.jsx';
import Achievements from '../subpage/Achievements.jsx';
import Games from '../subpage/Games.jsx';
import ProfileEditor from '../subpage/ProfileEditor';
import ProfileSettings from '../subpage/ProfileSettings';
import PasswordChange from "../subpage/PasswordChange.jsx";
import UserAvatar from "../../data/UserAvatar";


const Home = () => {

    const saveUserData = async (data) => {
        await UserData.saveUserData(data);
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState(false);

    // loader state while checking persisted session
    const [isBooting, setIsBooting] = useState(true);

    const [currentPage, setCurrentPage] = useState('home');
    const [currentSubPage, setCurrentSubPage] = useState('games');

    async function fetchUserData() {
        try {
            const userData = await UserDataRequest();
            if (!userData) return false;
            await saveUserData(userData);
            await fetchUserAvatar(userData.id);
            return true;
        } catch (error) {
            return false;
        }
    }

    async function fetchUserAvatar(userId) {
        try {
            return await UserAvatar.fetchAndSaveUserAvatar(userId);
        } catch (error) {
            return null;
        }
    }

    // Try to restore session on mount
    useEffect(() => {
        const init = async () => {
            try {
                // 1) if userData already present, treat as logged in (instant paint)
                const stored = UserData.loadUserData();
                if (stored && stored.id) {
                    setIsLoggedIn(true);
                    setIsBooting(false);
                    return;
                }

                // 2) no cached user: probe the server using the httpOnly session
                // cookie (sent automatically via credentials: 'include'). A valid
                // cookie restores the session; otherwise we fall through to login.
                const ok = await fetchUserData();
                if (ok) {
                    setIsLoggedIn(true);
                    setIsBooting(false);
                } else {
                    UserData.clearUserData();
                }
            } catch (err) {
                console.error('Error while restoring session:', err);
            } finally {
                // stop booting even if session is not restored
                setIsBooting(false);
            }
        };

        init();
    }, []);

    // Redirect control: if we are on /redirect, don't allow setIsLoggedIn to affect this view
    const isRedirectPath = window.location.pathname.includes('/redirect');

    const handleLogin = async (userLoginData) => {
        try {
            const response = await LoginUserRequest(userLoginData);
            if (response && response.success === true) {
                // Andromeda sets the httpOnly auth cookie on the login response; there
                // is no token to persist client-side. Fetch and cache user data, then
                // mark as logged in.
                await fetchUserData();

                if (!isRedirectPath) {
                    setIsLoggedIn(true);
                    setCurrentPage("home");
                }
            } else {
                setLoginError(true);
            }
        } catch (error) {
            console.error("Error retrieving JSON data for JWT:", error);
            setLoginError(true);
        }
    };

    const handleRegister = async (userObject) => {
        try {
            const response = await RegistrationRequest(userObject);
            if (response.success === true) {
                console.log(`User: ${userObject.login} successfully registered.`);
                handleNavigate('confirmation-info');
            } else {
                console.error(`Registration failed for user ${userObject.login}:`, response.message);
                alert(`Registration failed: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error during registration request:", error);
            alert("An error occurred during registration. Please try again.");
        }
    };

    const handleNavigate = (page) => {
        if (page === 'logout') {
            handleLogout().then();
        } else setCurrentPage(page);
    };

    const handleSubNavigate = (subpage) => {
        setCurrentSubPage(subpage);
    };

    const handleLogout = async () => {
        // Clear cached client-side session state. NOTE: the httpOnly auth cookie can
        // only be cleared by the server — a backend logout endpoint (pending the
        // Nebula API contract) should be invoked here to invalidate the server-side
        // session and expire the cookie.
        UserData.clearUserData();
        sessionStorage.clear();
        setIsLoggedIn(false);
        setCurrentPage("login");
    }

    // show a loader while we determine logged-in state to avoid UI flicker
    if (isBooting) {
        return (
            <div className='theme-style'>
                <div style={{padding: 24}}>Loading...</div>
            </div>
        );
    }

    return (
        <div className='theme-style' style={{display: 'flex', flexDirection: 'column', flex: 1}}>
            {currentPage === 'home' && (
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                    {isLoggedIn ? (
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <Menu isLoggedIn={isLoggedIn} onNavigate={handleNavigate}
                                  onSubNavigate={handleSubNavigate}/>
                            <div className="subpage-container">
                                {currentSubPage === 'achievements' && <Achievements/>}
                                {currentSubPage === 'profileEditor' && <ProfileEditor/>}
                                {currentSubPage === 'profileSettings' && <ProfileSettings/>}
                                {currentSubPage === 'passwordChange' && <PasswordChange/>}
                                {currentSubPage === 'games' && <Games/>}
                            </div>
                        </div>
                    ) : (
                        <LoginForm onLogin={handleLogin} loginError={loginError} onNavigate={handleNavigate}/>
                    )}
                </div>
            )}

            {currentPage === 'login' && (
                <LoginForm onLogin={handleLogin} loginError={loginError} onNavigate={handleNavigate}/>
            )}
            {currentPage === 'recovery' && (
                <PasswordRecovery onNavigate={handleNavigate}/>
            )}
            {currentPage === 'register' && (
                <RegistrationForm onRegister={handleRegister} onNavigate={handleNavigate}/>
            )}
            {currentPage === 'confirmation-info' && (
                <ConfirmationInfo onNavigate={handleNavigate}/>
            )}
        </div>
    );
};

export default Home;