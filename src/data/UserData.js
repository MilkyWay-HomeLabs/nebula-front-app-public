import UserDataRequest from "../api/user/UserDataRequest";

const STORAGE_KEY = 'userData';

const UserData = {
    saveUserData: async (userData) => {
        try {
            if (!userData) {
                console.warn('Attempted to save empty user data');
                return false;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Error during saving user data:', error);
            return false;
        }
    },

    loadUserData: () => {
        try {
            const item = localStorage.getItem(STORAGE_KEY);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error during loading user data:', error);
            return null;
        }
    },

    fetchUserData: async () => {
        try {
            const userData = await UserDataRequest();
            if (userData) {
                await UserData.saveUserData(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during fetching user data:', error);
            return false;
        }
    },

    clearUserData: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error during removing user token:', error);
            return false;
        }
    },

    getUserId() {
        const userData = this.loadUserData();
        return userData?.id || null;
    },

    getThemeName() {
        const userData = this.loadUserData();
        return userData?.settings?.general?.theme?.name || null;
    },

    setTemporaryTheme(theme) {
        try {
            const userData = this.loadUserData();
            if (!userData) return false;

            if (!userData.settings) userData.settings = {};
            if (!userData.settings.general) userData.settings.general = {};
            userData.settings.general.theme = theme;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Error during setting temporary theme:', error);
            return false;
        }
    }
};

export default UserData;
