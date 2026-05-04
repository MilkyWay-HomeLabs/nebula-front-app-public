import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Games from '../../../../src/view/subpage/Games.jsx';
import UserData from '../../../../src/data/UserData';

vi.mock('../../../../src/data/UserData', () => ({
    default: {
        getThemeName: vi.fn().mockReturnValue('Default'),
        loadUserData: vi.fn()
    }
}));
vi.mock('../../../../src/singles/ThemeListenerSingleton', () => ({
    default: {addObserver: vi.fn(), removeObserver: vi.fn()}
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('Games - integration', () => {
    test('renders GameButton components and clicking enabled one triggers navigation assignment', async () => {
        const games = [
            {id: 1, name: 'Chess', iconUrl: '/i.svg', enable: true, pageUrl: '/nebula/app/chess'},
            {id: 2, name: 'Puzzel', iconUrl: '/p.svg', enable: false, pageUrl: '/nebula/app/puzzel'}
        ];
        UserData.loadUserData.mockResolvedValue({id: 1, login: 't', games});

        // stub window.location to capture href changes
        vi.stubGlobal('location', {href: ''});

        render(<Games/>);

        await waitFor(() => {
            expect(screen.getByText('Chess')).toBeDefined();
            expect(screen.getByText('Puzzel')).toBeDefined();
        });

        // click Chess button (its rendering depends on GameButton markup)
        // find by text then traverse to button
        const chessText = screen.getByText('Chess');
        const btn = chessText.closest('button') || chessText.parentElement;
        await userEvent.click(btn);
        expect(global.location.href).toBe('/nebula/app/chess');
    });
});
