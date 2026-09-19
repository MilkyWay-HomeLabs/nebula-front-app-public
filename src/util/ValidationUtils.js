/**
 * Utility class containing static validation methods for various user input scenarios,
 * such as login data, profile updates, registration information, and more.
 */
class ValidationUtils {

    /**
     * Validates the given login data, checking if login or email is valid and password is strong.
     *
     * @param {string} loginOrEmail - The login or email to validate.
     * @param {string} password - The password to validate.
     * @return {boolean} Returns true if the login/email is valid and the password is strong; otherwise, returns false.
     */
    static isLoginDataValid(loginOrEmail, password) {
        if (!ValidationUtils.isEmailValid(loginOrEmail) && !ValidationUtils.isLoginValid(loginOrEmail)) return false;
        return ValidationUtils.isStrongPassword(password);
    }

    /**
     * Validates the profile update data to ensure all fields meet the specified requirements.
     *
     * @param {Object} profileData - The profile data to validate.
     * @param {string} profileData.firstName - The first name to validate.
     * @param {string} profileData.lastName - The last name to validate.
     * @param {Object} profileData.nationality - The nationality object containing ID to validate.
     * @param {number|string} profileData.nationality.id - The ID of the nationality to validate.
     * @param {Object} profileData.gender - The gender object containing ID to validate.
     * @param {number|string} profileData.gender.id - The ID of the gender to validate.
     * @param {string} profileData.birthDate - The birth date to validate.
     * @return {boolean} - Returns true if all fields are valid, otherwise false.
     */
    static isProfileUpdateDataValid(profileData) {
        if (!ValidationUtils.isTextNameValid(profileData.firstName)) return false;
        if (!ValidationUtils.isTextNameValid(profileData.lastName)) return false;
        if (!ValidationUtils.isNationalityValid(profileData.nationality.id)) return false;
        if (!ValidationUtils.isGenderValid(profileData.gender.id)) return false;
        return ValidationUtils.isBirthDateValid(profileData.birthDate);
    }

    /**
     * Validates user registration data by checking the validity of each provided parameter.
     *
     * @param {string} login - The login name or username provided by the user.
     * @param {string} email - The email address provided by the user.
     * @param {string} password1 - The first password entry from the user.
     * @param {string} password2 - The second password entry from the user for confirmation.
     * @param {Date} birthdate - The birthdate provided by the user.
     * @param {number} nationalityId - The nationality id provided by the user.
     * @param {number} genderId - The gender id provided by the user.
     * @return {boolean} Returns true if all parameters are valid; otherwise, returns false.
     */
    static isRegistrationDataValid(login, email, password1, password2, birthdate, nationalityId, genderId) {
        if (!ValidationUtils.isLoginValid(login)) return false;
        if (!ValidationUtils.isEmailValid(email)) return false;
        if (!ValidationUtils.isPasswordValid(password1, password2)) return false;
        if (!ValidationUtils.isBirthDateValid(birthdate)) return false;
        if (!ValidationUtils.isNationalityValid(nationalityId)) return false;
        return ValidationUtils.isGenderValid(genderId);
    }

    /**
     * Validates if the provided login text meets the required criteria.
     *
     * @param {string} text - The login text to validate.
     * @return {boolean} Returns true if the login text is valid, otherwise false.
     */
    static isLoginValid(text) {
        const textRegex = /^[A-Za-z0-9\-]{3,45}$/;
        return textRegex.test(text);
    }

    /**
     * Validates if the provided text name adheres to specific formatting rules.
     *
     * The text name must:
     * - Contain only alphanumeric characters, spaces, or hyphens.
     * - Be between 3 and 45 characters long.
     *
     * @param {string} text - The text name to validate.
     * @return {boolean} Returns true if the text is valid, otherwise false.
     */
    static isTextNameValid(text) {
        const textRegex = /^[a-zA-Z1-9\s-]{3,45}$/;
        return textRegex.test(text);
    }

    /**
     * Validates if the provided email address follows a proper email format.
     *
     * @param {string} email - The email address to be validated.
     * @return {boolean} - Returns true if the email address is valid, otherwise false.
     */
    static isEmailValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validates whether the password update details meet the required conditions.
     *
     * @param {Object} passwordObject - The object containing password fields for validation.
     * @param {string} passwordObject.currentPassword - The current password of the user.
     * @param {string} passwordObject.newPassword - The new password intended to replace the current password.
     * @param {string} passwordObject.confirmPassword - The confirmation for the new password.
     * @return {boolean} Returns true if the password update details are valid; otherwise, false.
     */
    static isUpdatePasswordValid(passwordObject) {
        if (!ValidationUtils.isPasswordMatches(passwordObject.newPassword, passwordObject.confirmPassword)) return false;
        if (!ValidationUtils.isStrongPassword(passwordObject.currentPassword)) return false;
        return ValidationUtils.isStrongPassword(passwordObject.newPassword);
    }

    /**
     * Checks if the provided passwords match and if the first password meets strength requirements.
     *
     * @param {string} first_password - The first password to validate.
     * @param {string} second_password - The second password to compare against the first password.
     * @return {boolean} Returns true if the passwords match and the first password is strong, otherwise false.
     */
    static isPasswordValid(first_password, second_password) {
        if (!ValidationUtils.isPasswordMatches(first_password, second_password)) return false;
        return ValidationUtils.isStrongPassword(first_password);
    }

    /**
     * Compares two password strings to determine if they match.
     *
     * @param {string} first_password - The first password to compare.
     * @param {string} second_password - The second password to compare.
     * @return {boolean} Returns true if the passwords match, otherwise false.
     */
    static isPasswordMatches(first_password, second_password) {
        return first_password === second_password;
    }

    /**
     * Checks if a given password is strong according to certain criteria.
     * A strong password must:
     * - Contain at least one lowercase letter.
     * - Contain at least one uppercase letter.
     * - Contain at least one digit.
     * - Have a minimum length of 8 characters.
     *
     * @param {string} password - The password string to be validated.
     * @return {boolean} Returns true if the password meets the strength criteria, otherwise false.
     */
    static isStrongPassword(password) {
        if (typeof password !== 'string') return false;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongPasswordRegex.test(password);
    }

    /**
     * Validates if the provided birthdate is realistic and meets age criteria.
     *
     * @param {string|Date} date - The birthdate to validate. Can be a string or Date object.
     * @return {boolean} - Returns true if the birthdate is valid, otherwise false.
     */
    static isBirthDateValid(date) {
        if (isNaN(new Date(date).getTime())) {
            return false;
        }
        const currentYear = new Date().getFullYear();
        const inputYear = new Date(date).getFullYear();
        if (inputYear > currentYear || inputYear < currentYear - 100) {
            return false;
        }
        return inputYear <= currentYear - 8;
    }

    /**
     * Validates if the given nationality ID is within the valid range.
     *
     * @param {number} nationalityId - The ID of the nationality to validate.
     * @return {boolean} Returns true if the nationality ID is valid, otherwise false.
     */
    static isNationalityValid(nationalityId) {
        return nationalityId > 0 && nationalityId < 253;
    }

    /**
     * Validates if the provided gender ID represents a valid gender.
     *
     * @param {number} genderId - The identifier of the gender to validate.
     * @return {boolean} Returns true if the gender ID is valid, otherwise false.
     */
    static isGenderValid(genderId) {
        return genderId > 0 && genderId < 4;
    }

}

export default ValidationUtils;
