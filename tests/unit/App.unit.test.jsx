import {render, screen, waitFor, cleanup} from '@testing-library/react';
import App from '../../src/App';
import UserData from '../../src/data/UserData';
import themeListenerSingletonInstance from '../../src/singles/ThemeListenerSingleton';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import packageInfo from '../../package.json';

// Mocking dependencies
vi.mock('../../src/data/UserData', () => ({
    default: {
        getThemeName: vi.fn()
    }
}));

vi.mock('../../src/singles/ThemeListenerSingleton', () => ({
    default: {
        addObserver: vi.fn(),
        removeObserver: vi.fn()
    }
}));

vi.mock('../../src/AppRoutes', () => ({
    AppRoutes: () => <div data-testid="app-routes">App Routes</div>
}));

// Mocking import.meta.env.BASE_URL
vi.mock('import.meta.env', () => ({
    BASE_URL: '/'
}));

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        UserData.getThemeName.mockResolvedValue('Dark');
    });

    afterEach(() => {
        cleanup();
    });

    it('initializes with theme from UserData', async () => {
        render(<App />);
        
        await waitFor(() => {
            expect(UserData.getThemeName).toHaveBeenCalled();
        });

        const mainElements = await screen.findAllByRole('main');
        expect(mainElements[0].getAttribute('data-theme')).toBe('Dark');
    });

    it('defaults to "Default" theme if UserData returns null', async () => {
        UserData.getThemeName.mockResolvedValue(null);
        render(<App />);

        const mainElements = await screen.findAllByRole('main');
        expect(mainElements[0].getAttribute('data-theme')).toBe('Default');
    });

    it('adds and removes theme listener observer', () => {
        const { unmount } = render(<App />);
        
        expect(themeListenerSingletonInstance.addObserver).toHaveBeenCalled();
        
        unmount();
        
        expect(themeListenerSingletonInstance.removeObserver).toHaveBeenCalled();
    });

    it('renders footer with correct version and author', async () => {
        render(<App />);
        
        const currentYear = new Date().getFullYear();
        expect(await screen.findByText(`Version: ${packageInfo.version}`)).toBeDefined();
        expect(await screen.findByText(new RegExp(`Author: Szymon Derleta © ${currentYear}`))).toBeDefined();
    });

    it('updates theme when observer is triggered', async () => {
        let observerCallback;
        themeListenerSingletonInstance.addObserver.mockImplementation((cb) => {
            observerCallback = cb;
        });

        render(<App />);

        await waitFor(() => {
            expect(UserData.getThemeName).toHaveBeenCalledTimes(1);
        });

        // Change the mock for the second call
        UserData.getThemeName.mockResolvedValue('Light');

        // Trigger the observer
        if (observerCallback) {
            await observerCallback();
        }

        const mainElements = await screen.findAllByRole('main');
        await waitFor(() => {
            expect(mainElements[0].getAttribute('data-theme')).toBe('Light');
        });
    });
});
