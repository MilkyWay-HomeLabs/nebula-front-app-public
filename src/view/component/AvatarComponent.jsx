import React, {useEffect, useState} from 'react';

import profile from '../../resources/default/profile.png';
import UserAvatar from "../../data/UserAvatar";
import avatarListenerSingletonInstance from "../../singles/AvatarListenerSingleton";

/**
 * AvatarComponent is a functional React component responsible for displaying a user's avatar.
 * It dynamically fetches and updates the avatar whenever there's a change detected via an observer.
 *
 * The component initializes with a default or previously loaded avatar and listens for updates
 * using an observer pattern to ensure the avatar reflects the latest state.
 *
 * Props:
 *  - width: Specifies the width of the avatar image.
 *  - height: Specifies the height of the avatar image.
 *
 * State Variables:
 *  - avatarSrc: Stores the URL of the current avatar image.
 *  - isAvatarLoaded: Indicates whether the avatar is fully loaded.
 *  - avatarUpdate: Triggers updates to re-fetch the avatar.
 *
 * Side Effects:
 *  - Establishes an observer to listen for avatar update events.
 *  - Cleans up the observer on a component unmounted.
 *
 * Async Functionality:
 *  - fetchAndSetAvatar: Handles fetching the latest avatar URL and updating the component state.
 *
 * Error Handling:
 *  - Logs errors to the console if an avatar fetch operation fails.
 */
const AvatarComponent = ({width, height}) => {
    const [avatarSrc, setAvatarSrc] = useState(profile);
    const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
    const [avatarUpdate, setAvatarUpdate] = useState(1);

    useEffect(() => {
        const fetchAndSetAvatar = async () => {
            try {
                const updatedAvatar = await UserAvatar.getUserAvatar();

                if (updatedAvatar) {
                    setAvatarSrc(updatedAvatar);
                    setIsAvatarLoaded(true);
                } else {
                    setAvatarSrc(profile);
                    setIsAvatarLoaded(false);
                }
            } catch (error) {
                console.error("Error updating avatar:", error);
                setAvatarSrc(profile);
                setIsAvatarLoaded(false);
            }
        };

        fetchAndSetAvatar().then(() => {
        });

        const handleAvatarUpdate = async () => {
            setAvatarUpdate((prev) => prev + 1);
            await fetchAndSetAvatar();
        };

        avatarListenerSingletonInstance.addObserver(handleAvatarUpdate);
        return () => {
            avatarListenerSingletonInstance.removeObserver(handleAvatarUpdate);
        };
    }, []);

    return (
        <div
            className={`avatar-frame ${isAvatarLoaded ? 'avatar-frame--loaded' : 'avatar-frame--fallback'}`}
            style={{width, height}}
        >
            <img
                src={avatarSrc || profile}
                alt="Avatar"
                className={`avatar ${isAvatarLoaded ? 'avatar--loaded' : 'avatar--fallback'}`}
                style={{width, height}}
                onError={(e) => {
                    e.currentTarget.src = profile;
                }}
            />
        </div>
    );
};

export default AvatarComponent;