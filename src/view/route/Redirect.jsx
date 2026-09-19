import React, {useEffect, useState} from 'react';
import LoginForm from "../page/LoginForm";
import {useNavigate, useSearchParams} from "react-router-dom";
import GETRequestPublic from "../../api/method/GETRequestPublic";
import {handleUserLogin, performRedirection} from "../../api/handler/handlerUserLogin.js";
import {APP_TOMCAT_DOMAIN} from "../../data/Credentials";
import UserData from "../../data/UserData";
import UserDataRequest from "../../api/user/UserDataRequest";

const GAMES_ENABLED_ENDPOINT_URL = `${APP_TOMCAT_DOMAIN}/v1/games/enabled`;

const Redirect = () => {
    const [games, setGames] = useState([]);
    const [loginError, setLoginError] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const destination = searchParams.get('destination');

    const fetchEnabledGames = async () => {
        try {
            const response = await GETRequestPublic(GAMES_ENABLED_ENDPOINT_URL);
            // eslint-disable-next-line no-console
            console.debug('Redirect: fetchEnabledGames response', response);
            if (response.success && response.data) {
                setGames(response.data);
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching enabled games:", error);
        }
        setGames([]);
        return [];
    };

    const checkAutoLogin = async (currentGames) => {
        const cachedUserData = UserData.loadUserData();

        try {
            // Try to use cached data first for immediate redirection
            if (cachedUserData?.games) {
                // eslint-disable-next-line no-console
                console.debug('Redirect: trying performRedirection using cachedUserData.games', cachedUserData.games, currentGames, destination);
                const redirected = performRedirection(cachedUserData.games, currentGames, destination, navigate);
                if (redirected) return true;
            }

            // Probe the server using the httpOnly session cookie (sent automatically
            // via credentials: 'include'). A valid cookie returns the user; a missing
            // or expired cookie returns null and we fall through to the login form.
            const userData = await UserDataRequest();
            // eslint-disable-next-line no-console
            console.debug('Redirect: fetched userData after login attempt', userData);
            if (userData) {
                await UserData.saveUserData(userData);
                const userGames = userData.games || [];
                // eslint-disable-next-line no-console
                console.debug('Redirect: trying performRedirection using fetched userGames', userGames, currentGames, destination);
                const redirected = performRedirection(userGames, currentGames, destination, navigate);
                if (redirected) return true;

                if (!destination) {
                    navigate('/', { replace: true });
                }
                return true;
            } else if (cachedUserData) {
                return true;
            }
        } catch (error) {
            console.error("Auto-login check failed:", error);
            if (cachedUserData) return true;
        }
        return false;
    };

    useEffect(() => {
        const init = async () => {
            const currentGames = await fetchEnabledGames();
            const loggedIn = await checkAutoLogin(currentGames);
            if (!loggedIn) {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const handleLogin = async (userLoginData) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            let currentGames = games;
            if (destination && (!currentGames || currentGames.length === 0)) {
                currentGames = await fetchEnabledGames();
            }
            await handleUserLogin(userLoginData, currentGames, destination, navigate, (error) => {
                setLoginError(error);
                // Only reset isProcessing if there's an error, 
                // because on success we expect to be redirected away
                if (error) {
                    setIsProcessing(false);
                }
            });
            
            // If we have a destination, we might still be on this page waiting for external redirect
            // If we don't have a destination, handleUserLogin already called navigate('/')
            if (destination) {
                // If it wasn't redirected, we should show error or allow retry
                // We'll set a timeout to check if we are still here
                setTimeout(() => {
                    if (window.location.href.includes('/redirect')) {
                        setIsProcessing(false);
                        // Optional: setLoginError("Game not found or access denied");
                    }
                }, 2000);
            }
        } catch (e) {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {isProcessing && <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Processing...</div>}
            <LoginForm onLogin={handleLogin} loginError={loginError} onNavigate={setCurrentPage}/>
        </div>
    );
};

export default Redirect;
