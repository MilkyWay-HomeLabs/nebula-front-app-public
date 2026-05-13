import React, {useEffect, useState} from 'react';
import {BrowserRouter} from 'react-router-dom';

import './App.css'
import packageInfo from '../package.json';
import UserData from "./data/UserData";
import themeListenerSingletonInstance from "./singles/ThemeListenerSingleton.js";
import {AppRoutes} from "./AppRoutes";

const App = () => {
    const [theme, setTheme] = useState('Default');
    const routerBase = import.meta.env.BASE_URL;

    const handleThemeUpdate = async () => {
        const themeName = await UserData.getThemeName();
        setTheme(themeName || 'Default');
    };

    useEffect(() => {
        const initTheme = async () => {
            const themeName = await UserData.getThemeName();
            setTheme(themeName || 'Default');
        };

        initTheme().catch(error => {
            console.error('Failed to initialize theme:', error);
        });

        themeListenerSingletonInstance.addObserver(handleThemeUpdate);
        return () => {
            themeListenerSingletonInstance.removeObserver(handleThemeUpdate);
        };
    }, []);

    useEffect(() => {
        document.title = "Nebula App";
    }, []);

    return (
        <main className="App theme-style" data-theme={theme}>
            <BrowserRouter
                basename={routerBase}
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <AppRoutes/>
            </BrowserRouter>
            <footer className="App-footer">
                <p>Version: {packageInfo.version}</p>
                <p>Author: Szymon Derleta &copy; {new Date().getFullYear()}</p>
            </footer>
        </main>
    );
};

export default App
