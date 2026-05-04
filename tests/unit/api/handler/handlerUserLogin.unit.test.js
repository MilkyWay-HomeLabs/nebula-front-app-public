import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUserLogin } from '../../../../src/api/handler/handlerUserLogin';
import LoginUserRequest from '../../../../src/api/account/LoginUserRequest';

vi.mock('../../../../src/api/account/LoginUserRequest', () => ({
    default: vi.fn(),
}));

describe('handlerUserLogin', () => {
    const mockNavigate = vi.fn();
    const mockSetLoginError = vi.fn();
    const mockUserLoginData = { username: 'test', password: 'password' };
    const mockGames = [{ name: 'Game1', pageUrl: 'http://game1.com' }];

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location.href
        delete window.location;
        window.location = { href: '' };
    });

    it('should navigate to root on successful login without matching game', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue({ success: true, token: 'abc' });

        await handleUserLogin(mockUserLoginData, mockGames, 'NoGame', mockNavigate, mockSetLoginError);

        expect(LoginUserRequest).toHaveBeenCalledWith(mockUserLoginData);
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(mockSetLoginError).not.toHaveBeenCalled();
        expect(localStorage.getItem('authToken')).toBe('abc');
    });

    it('should redirect to game URL on successful login with matching game', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue({ success: true, token: 'xyz' });

        await handleUserLogin(mockUserLoginData, mockGames, 'Game1', mockNavigate, mockSetLoginError);

        expect(window.location.href).toBe('http://game1.com');
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(localStorage.getItem('authToken')).toBe('xyz');
    });

    it('should set login error on unsuccessful login', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue(null);

        await handleUserLogin(mockUserLoginData, mockGames, 'Game1', mockNavigate, mockSetLoginError);

        expect(mockSetLoginError).toHaveBeenCalledWith(true);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should set login error and log error on request failure', async () => {
        const error = new Error('Network error');
        vi.mocked(LoginUserRequest).mockRejectedValue(error);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await handleUserLogin(mockUserLoginData, mockGames, 'Game1', mockNavigate, mockSetLoginError);

        expect(mockSetLoginError).toHaveBeenCalledWith(true);
        expect(consoleSpy).toHaveBeenCalledWith("Login process failed:", error);
        
        consoleSpy.mockRestore();
    });
});
