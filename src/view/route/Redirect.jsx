import React, {useEffect, useState} from 'react';
import LoginForm from "../page/LoginForm";
import {useNavigate, useSearchParams} from "react-router-dom";
import GETRequestPublic from "../../api/method/GETRequestPublic";
import {handleUserLogin} from "../../api/handler/handlerUserLogin.js";
import {APP_TOMCAT_DOMAIN} from "../../data/Credentials";

const GAMES_ENABLED_ENDPOINT_URL = `${APP_TOMCAT_DOMAIN}/nebula-rest-api/api/v1/games/enabled`;

const Redirect = () => {
    const [games, setGames] = useState([]);
    const [loginError, setLoginError] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const destination = searchParams.get('destination');

    const fetchEnabledGames = async () => {
        const url = `${APP_TOMCAT_DOMAIN}/nebula-rest-api/api/v1/games/enabled`;
        try {
            const response = await GETRequestPublic(url);
            if (response.success && response.data) {
                setGames(response.data);
            } else {
                setGames([]);
            }
        } catch (error) {
            console.error("Error fetching enabled games:", error);
            setGames([]);
        }
    };

    useEffect(() => {
        fetchEnabledGames();
    }, []);

    const handleLogin = async (userLoginData) => {
        let currentGames = games;
        if (destination && (!currentGames || currentGames.length === 0)) {
            const response = await GETRequestPublic(`${APP_TOMCAT_DOMAIN}/nebula-rest-api/api/v1/games/enabled`);
            if (response.success && response.data) {
                setGames(response.data);
                currentGames = response.data;
            }
        }
        handleUserLogin(userLoginData, currentGames, destination, navigate, setLoginError);
    };

    return (
        <div>
            <LoginForm onLogin={handleLogin} loginError={loginError} onNavigate={setCurrentPage}/>
        </div>
    );
};

export default Redirect;
