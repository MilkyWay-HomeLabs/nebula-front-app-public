import React, {useEffect, useState} from 'react';
import '../../resources/styles/FormDefault.css';

import UserData from '../../data/UserData';
import ThemeUpdaterFetchData from "../../api/components/updaters/ThemeUpdaterFetchData.jsx";
import UserSettingsUpdate from "../../api/user/UserSettingsUpdate";
import themeListenerSingletonInstance from "../../singles/ThemeListenerSingleton";

const initializeGeneralSettings = (userData) => ({
    userId: userData.id,
    theme: {
        id: userData.settings.general.theme.id,
        name: userData.settings.general.theme.name,
    },
});

const initializeSoundSettings = (userData) => ({
    userId: userData.id,
    muted: userData.settings.sound.muted,
    volumeMaster: userData.settings.sound.volumeMaster,
    volumeMusic: userData.settings.sound.volumeMusic,
    volumeEffects: userData.settings.sound.volumeEffects,
    volumeVoices: userData.settings.sound.volumeVoices,
    battleCry: userData.settings.sound.battleCry,
});

const VOLUME_FIELDS = ['volumeMaster', 'volumeMusic', 'volumeEffects', 'volumeVoices'];

const ProfileSettings = () => {
    const [themeUpdaterKey, setThemeUpdaterKey] = useState(17);
    const [generalSettings, setGeneralSettings] = useState({
        userId: 0,
        theme: {id: 17, name: "Default"}
    });
    const [soundSettings, setSoundSettings] = useState({
        userId: 0,
        battleCry: true,
        muted: false,
        volumeEffects: 100,
        volumeMaster: 100,
        volumeMusic: 100,
        volumeVoices: 100
    });

    useEffect(() => {
        const initializeUserData = async () => {
            const userData = await UserData.loadUserData();
            if (userData) {
                setGeneralSettings(initializeGeneralSettings(userData));
                setSoundSettings(initializeSoundSettings(userData));
                setThemeUpdaterKey((prevKey) => prevKey + 1);
            }
        };
        initializeUserData();
    }, []);

    const handleSoundChange = (e) => {
        const {name, value, type, checked} = e.target;
        setSoundSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value)
        }));
    };

    const handleThemeChange = (theme) => {
        setGeneralSettings(prev => ({...prev, theme}));
        UserData.setTemporaryTheme(theme);
        themeListenerSingletonInstance.notifyObservers();
    };

    const saveChanges = async () => {
        const result = await UserSettingsUpdate(generalSettings, soundSettings);
        console.log('UserSettingsUpdate result:', result);
        const isSuccess = result === true || (result && (result.success === true || (result.data && typeof result.data === 'object')));
        if (isSuccess) {
            const updated = await UserData.fetchUserData();
            if (updated) {
                alert('Profile data updated');
                await themeListenerSingletonInstance.notifyObservers();
            } else {
                alert('Profile data updated but not downloaded');
            }
        } else {
            alert('Something is wrong...');
        }
    };

    return (
        <div className="div-major" data-testid="profile-settings-root" data-e2e="profile-settings-root">
            <h1 data-e2e="profile-settings-heading">Settings</h1>

            <form
                className="form-major"
                data-testid="profile-settings-form"
                data-e2e="profile-settings-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    saveChanges();
                }}
            >
                <h2 className="settings-section-title">General</h2>

                <label className="label-default" htmlFor="theme-select">
                    Theme:
                    <ThemeUpdaterFetchData
                        key={themeUpdaterKey}
                        value={generalSettings.theme}
                        onChange={handleThemeChange}
                    />
                </label>

                <h2 className="settings-section-title">Sound</h2>

                {VOLUME_FIELDS.map((field) => (
                    <label className="label-default" key={field} htmlFor={field}>
                        {field.replace('volume', 'Volume ')}:
                        <div className="settings-range-row">
                            <input
                                id={field}
                                type="range"
                                name={field}
                                min="0"
                                max="100"
                                value={soundSettings?.[field] ?? 0}
                                onChange={handleSoundChange}
                                className="settings-range"
                                data-testid={`range-${field}`}
                            />
                            <span className="settings-range-value">{soundSettings?.[field] ?? 0}</span>
                        </div>
                    </label>
                ))}

                <div className="settings-checkboxes">
                    <label className="settings-checkbox-label">
                        <input
                            type="checkbox"
                            name="battleCry"
                            checked={soundSettings.battleCry}
                            onChange={handleSoundChange}
                            data-testid="checkbox-battle-cry"
                        />
                        Battle Cry
                    </label>
                    <label className="settings-checkbox-label">
                        <input
                            type="checkbox"
                            name="muted"
                            checked={soundSettings.muted}
                            onChange={handleSoundChange}
                            data-testid="checkbox-muted"
                        />
                        Muted
                    </label>
                </div>

                <button
                    type="submit"
                    className="button-registration"
                    data-testid="save-settings-button"
                    data-e2e="save-settings-button"
                >
                    Save changes
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;
