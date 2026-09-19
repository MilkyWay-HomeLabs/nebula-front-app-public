import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUserLogin } from '../../../../src/api/handler/handlerUserLogin';
import LoginUserRequest from '../../../../src/api/account/LoginUserRequest';
import UserDataRequest from '../../../../src/api/user/UserDataRequest';

vi.mock('../../../../src/api/account/LoginUserRequest', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/user/UserDataRequest', () => ({
    default: vi.fn(),
}));

describe('performRedirection', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        delete (window).location;
        window.location = { href: '' };
    });

    it('should redirect to user game URL if found', () => {
        const userGames = [{ name: 'Hacman', pageUrl: 'https://hacman.com' }];
        const publicGames = [];
        const destination = 'Hacman';

        import('../../../../src/api/handler/handlerUserLogin').then(({ performRedirection }) => {
            const redirected = performRedirection(userGames, publicGames, destination, mockNavigate);
            expect(redirected).toBe(true);
            expect(window.location.href).toBe('https://hacman.com');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('should fallback to public game URL if not found in user games', () => {
        const userGames = [];
        const publicGames = [{ name: 'Game1', pageUrl: 'http://game1.com' }];
        const destination = 'Game1';

        import('../../../../src/api/handler/handlerUserLogin').then(({ performRedirection }) => {
            const redirected = performRedirection(userGames, publicGames, destination, mockNavigate);
            expect(redirected).toBe(true);
            expect(window.location.href).toBe('http://game1.com');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('should navigate to / if game not found anywhere and destination is provided', async () => {
        const userGames = [];
        const publicGames = [];
        const destination = 'Unknown';

        const { performRedirection } = await import('../../../../src/api/handler/handlerUserLogin');
        const redirected = performRedirection(userGames, publicGames, destination, mockNavigate);
        expect(redirected).toBe(false);
        // performRedirection should NOT call navigate
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should NOT navigate to / if destination is NOT provided in performRedirection', async () => {
        const userGames = [];
        const publicGames = [];
        const destination = null;

        const { performRedirection } = await import('../../../../src/api/handler/handlerUserLogin');
        const redirected = performRedirection(userGames, publicGames, destination, mockNavigate);
        expect(redirected).toBe(false);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});

describe('handlerUserLogin', () => {
    const mockNavigate = vi.fn();
    const mockSetLoginError = vi.fn();
    const mockUserLoginData = { username: 'test', password: 'password' };
    const mockGames = [{ name: 'Game1', pageUrl: 'http://game1.com' }];

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location.href
        delete (window).location;
        window.location = { href: '' };
        vi.mocked(UserDataRequest).mockResolvedValue(null);
    });

    it('should navigate to root on successful login if destination NOT provided', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue({ success: true, data: { token: 'abc' } });

        await handleUserLogin(mockUserLoginData, mockGames, null, mockNavigate, mockSetLoginError);

        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should redirect to game URL from userData on successful login with matching game', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue({ success: true, data: { token: 'xyz' } });
        vi.mocked(UserDataRequest).mockResolvedValue({
            games: [
                { name: 'Hacman', pageUrl: 'https://milkyway.test/hacman/app/' }
            ]
        });

        await handleUserLogin(mockUserLoginData, mockGames, 'Hacman', mockNavigate, mockSetLoginError);

        expect(window.location.href).toBe('https://milkyway.test/hacman/app/');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect to game URL from public games if not found in userData', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue({ success: true, data: { token: 'xyz' } });
        vi.mocked(UserDataRequest).mockResolvedValue({
            games: []
        });

        await handleUserLogin(mockUserLoginData, mockGames, 'Game1', mockNavigate, mockSetLoginError);

        expect(window.location.href).toBe('http://game1.com');
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

    it('should use public games fallback if UserDataRequest fails', async () => {
        vi.mocked(LoginUserRequest).mockResolvedValue({ success: true, data: { token: 'xyz' } });
        vi.mocked(UserDataRequest).mockResolvedValue(null);

        await handleUserLogin(mockUserLoginData, mockGames, 'Game1', mockNavigate, mockSetLoginError);

        expect(window.location.href).toBe('http://game1.com');
    });
});
