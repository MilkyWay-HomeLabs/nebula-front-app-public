import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameButton from '../../../../src/view/component/GameButton.jsx';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('GameButton - unit', () => {
    test('renders icon and name when iconUrl provided', () => {
        const game = {id: 1, name: 'Chess', iconUrl: '/icons/chess.svg', enable: true, pageUrl: '/games/chess'};
        const {container} = render(<GameButton game={game}/>);
        const root = within(container);
        expect(root.getByAltText(/Chess/i)).toBeInTheDocument();
        expect(root.getByText(/Chess/i)).toBeInTheDocument();
    });

    test('navigates to pageUrl when enabled and clicked', async () => {
        const game = {
            id: 2,
            name: 'Racer',
            iconUrl: '/icons/racer.svg',
            enable: true,
            pageUrl: '/nebula/app/test-game'
        };

        // Stub global location object so assignments don't actually navigate in jsdom
        vi.stubGlobal('location', {href: ''});

        const {container} = render(<GameButton game={game}/>);
        const root = within(container);

        await userEvent.click(root.getByRole('button'));
        // component sets window.location.href = game.pageUrl
        expect(global.location.href).toBe(game.pageUrl);
    });

    test('does not navigate when disabled', async () => {
        const game = {
            id: 3,
            name: 'DisabledGame',
            iconUrl: '/icons/none.svg',
            enable: false,
            pageUrl: '/should-not-navigate'
        };

        vi.stubGlobal('location', {href: ''});

        const {container} = render(<GameButton game={game}/>);
        const root = within(container);

        // clicking disabled button should have no effect
        await userEvent.click(root.getByRole('button'));
        expect(global.location.href).toBe('');
    });
});
