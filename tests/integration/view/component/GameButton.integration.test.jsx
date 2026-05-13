import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Games from '../../../../src/view/subpage/Games.jsx';

// Mock modules before importing Games component
vi.mock('../../../../src/data/UserData', () => ({
    // default export is an object with methods used by Games.jsx
    default: {
        loadUserData: vi.fn().mockResolvedValue({
            id: 1,
            login: 'test',
            games: [
                {id: 1, name: 'Chess', iconUrl: '/icons/chess.svg', enable: true, pageUrl: '/nebula/app/test-game'},
                {id: 2, name: 'Puzzel', iconUrl: '/icons/puzzel.svg', enable: false, pageUrl: '/nebula/app/puzzel'}
            ]
        }),
        getThemeName: vi.fn().mockReturnValue('Default')
    }
}));

vi.mock('../../../../src/singles/ThemeListenerSingleton', () => ({
    // simple mock singleton with add/remove no-op
    default: {
        addObserver: () => {
        },
        removeObserver: () => {
        }
    }
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('GameButton - integration (Games wrapper)', () => {
    test('renders list of game buttons from UserData and clicking navigates', async () => {
        // stub global location
        vi.stubGlobal('location', {href: ''});

        const {container} = render(<Games/>);
        const root = within(container);

        // wait for the async loadUserData to populate the UI
        await waitFor(() => {
            expect(root.getByText(/Chess/i)).toBeInTheDocument();
            expect(root.getByText(/Puzzel/i)).toBeInTheDocument();
        });

        // click enabled game and assert navigation
        await userEvent.click(root.getByText(/Chess/i));
        expect(global.location.href).toBe('/nebula/app/test-game');
    });
});
