import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import Games from '../../../../src/view/subpage/Games.jsx';
import UserData from '../../../../src/data/UserData';
import themeListenerSingletonInstance from '../../../../src/singles/ThemeListenerSingleton';

// mocks
vi.mock('../../../../src/data/UserData', () => ({
    default: {
        getThemeName: vi.fn().mockReturnValue('Default'),
        loadUserData: vi.fn()
    }
}));
vi.mock('../../../../src/singles/ThemeListenerSingleton', () => ({
    default: {addObserver: vi.fn(), removeObserver: vi.fn()}
}));
// mock GameButton so we can inspect counts / props easily
vi.mock('../../../../src/view/component/GameButton.jsx', () => ({
    default: ({game}) => <div data-testid="mock-game-button">{game.name}</div>
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('Games - unit', () => {
    test('registers theme listener on mount and removes on unmount', async () => {
        const addSpy = themeListenerSingletonInstance.addObserver;
        const removeSpy = themeListenerSingletonInstance.removeObserver;

        // make loadUserData resolve to empty
        UserData.loadUserData.mockResolvedValue({id: 1, login: 'x', games: []});

        const {unmount} = render(<Games/>);
        expect(addSpy).toHaveBeenCalled();

        // unmount -> cleanup should remove observer
        unmount();
        expect(removeSpy).toHaveBeenCalled();
    });

    test('renders game buttons when userData contains games', async () => {
        const games = [
            {id: 1, name: 'Chess', iconUrl: '/i.svg', enable: true, pageUrl: '/g/chess'},
            {id: 2, name: 'Racer', iconUrl: '/r.svg', enable: false, pageUrl: '/g/racer'}
        ];
        UserData.loadUserData.mockResolvedValue({id: 1, login: 'test', games});

        render(<Games/>);

        // wait for async loadUserData to resolve and component to update
        await waitFor(() => {
            expect(screen.getAllByTestId('mock-game-button').length).toBe(2);
            expect(screen.getByText('Chess')).toBeDefined();
            expect(screen.getByText('Racer')).toBeDefined();
        });
    });

    test('handles loadUserData error gracefully', async () => {
        UserData.loadUserData.mockRejectedValue(new Error('fail'));
        render(<Games/>);
        // after error, component should not throw and games list remains empty
        await waitFor(() => {
            expect(screen.queryByTestId('mock-game-button')).toBeNull();
        });
    });
});