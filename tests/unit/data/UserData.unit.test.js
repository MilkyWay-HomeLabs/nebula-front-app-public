import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserData from '../../../src/data/UserData';
import UserDataRequest from '../../../src/api/user/UserDataRequest';

vi.mock('../../../src/api/user/UserDataRequest');

describe('UserData', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('saveUserData', () => {
        it('should save user data to localStorage and return true', async () => {
            const userData = { id: 1, name: 'Test User' };
            const result = await UserData.saveUserData(userData);
            
            expect(result).toBe(true);
            expect(localStorage.getItem('userData')).toBe(JSON.stringify(userData));
        });

        it('should return false if userData is null', async () => {
            const result = await UserData.saveUserData(null);
            expect(result).toBe(false);
        });
    });

    describe('loadUserData', () => {
        it('should load user data from localStorage', () => {
            const userData = { id: 1, name: 'Test User' };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            const result = UserData.loadUserData();
            expect(result).toEqual(userData);
        });

        it('should return null if no data in localStorage', () => {
            const result = UserData.loadUserData();
            expect(result).toBe(null);
        });

        it('should return null and log error if JSON is invalid', () => {
            localStorage.setItem('userData', 'invalid-json');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            const result = UserData.loadUserData();
            expect(result).toBe(null);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('fetchUserData', () => {
        it('should fetch data and save it', async () => {
            const userData = { id: 1, name: 'Fetched User' };
            vi.mocked(UserDataRequest).mockResolvedValue(userData);
            
            const result = await UserData.fetchUserData();
            
            expect(result).toBe(true);
            expect(localStorage.getItem('userData')).toBe(JSON.stringify(userData));
        });

        it('should return false if fetch fails', async () => {
            vi.mocked(UserDataRequest).mockRejectedValue(new Error('Fetch failed'));
            
            const result = await UserData.fetchUserData();
            expect(result).toBe(false);
        });
    });

    describe('clearUserData', () => {
        it('should remove userData from localStorage', () => {
            localStorage.setItem('userData', 'some-data');
            const result = UserData.clearUserData();
            
            expect(result).toBe(true);
            expect(localStorage.getItem('userData')).toBe(null);
        });
    });

    describe('getUserId', () => {
        it('should return user id', () => {
            localStorage.setItem('userData', JSON.stringify({ id: 123 }));
            expect(UserData.getUserId()).toBe(123);
        });

        it('should return null if no user data', () => {
            expect(UserData.getUserId()).toBe(null);
        });
    });

    describe('getThemeName', () => {
        it('should return theme name', () => {
            localStorage.setItem('userData', JSON.stringify({
                settings: { general: { theme: { name: 'dark' } } }
            }));
            expect(UserData.getThemeName()).toBe('dark');
        });

        it('should return null if path is missing', () => {
            localStorage.setItem('userData', JSON.stringify({ settings: {} }));
            expect(UserData.getThemeName()).toBe(null);
        });
    });

    describe('setTemporaryTheme', () => {
        it('should update theme in localStorage', () => {
            localStorage.setItem('userData', JSON.stringify({ settings: { general: {} } }));
            const theme = { name: 'light' };
            
            const result = UserData.setTemporaryTheme(theme);
            
            expect(result).toBe(true);
            const saved = JSON.parse(localStorage.getItem('userData'));
            expect(saved.settings.general.theme).toEqual(theme);
        });

        it('should return false if no user data', () => {
            const result = UserData.setTemporaryTheme({ name: 'light' });
            expect(result).toBe(false);
        });
    });
});
