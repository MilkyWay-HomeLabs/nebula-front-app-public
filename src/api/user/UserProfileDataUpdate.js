import { APP_REQUEST_URL } from '../../data/Credentials';
import DateTimeUtils from "../../util/DateTimeUtils";
import { PATCHRequest } from "../handler/handlerTokenRefresh";

/**
 * Updates the user's profile data.
 * @param {Object} profileData - The profile data to update.
 * @returns {Promise<Object>} The updated profile data.
 * @throws {Error} If the request fails.
 */
async function UserProfileDataUpdate(profileData) {
    const url = `${APP_REQUEST_URL}/users/profile`;
    const payload = createUpdatePayload(profileData);
    
    try {
        const response = await PATCHRequest(url, payload);
        return response.success === true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return false;
    }
}

/**
 * Creates the payload for the profile update request.
 * @param {Object} profileData - The source profile data.
 * @returns {Object} The formatted payload.
 */
function createUpdatePayload(profileData) {
    const birthdate = DateTimeUtils.transformToTimestamp(profileData.birthDate);
    return {
        userId: profileData.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        birthdate: birthdate,
        nationalityId: profileData.nationality?.id,
        genderId: profileData.gender?.id
    };
}

export default UserProfileDataUpdate;
