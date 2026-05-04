import { APP_REQUEST_URL } from '../../data/Credentials';
import { PUTRequest } from "../handler/handlerTokenRefresh";

/**
 * Updates the user's settings.
 * @param {Object} generalSettings - General settings (theme, etc.).
 * @param {Object} soundSettings - Sound settings.
 * @returns {Promise<Object>} The updated settings.
 * @throws {Error} If the request fails.
 */
async function UserSettingsUpdate(generalSettings, soundSettings) {
    const url = `${APP_REQUEST_URL}/users/settings`;
    const payload = createUpdatePayload(generalSettings, soundSettings);
    
    try {
        const response = await PUTRequest(url, payload);
        return response.success === true;
    } catch (error) {
        console.error('Error updating user settings:', error);
        return false;
    }
}

/**
 * Creates the payload for the settings update request.
 * @param {Object} generalSettings - General settings source.
 * @param {Object} soundSettings - Sound settings source.
 * @returns {Object} The formatted payload.
 */
function createUpdatePayload(generalSettings, soundSettings) {
    return {
        userId: generalSettings.userId,
        general: {
            userId: generalSettings.userId,
            theme: {
                id: generalSettings.theme?.id,
                name: generalSettings.theme?.name,
            },
        },
        sound: {
            userId: soundSettings.userId,
            muted: soundSettings.muted,
            battleCry: soundSettings.battleCry,
            volumeMaster: soundSettings.volumeMaster,
            volumeMusic: soundSettings.volumeMusic,
            volumeEffects: soundSettings.volumeEffects,
            volumeVoices: soundSettings.volumeVoices,
        }
    };
}

export default UserSettingsUpdate;
