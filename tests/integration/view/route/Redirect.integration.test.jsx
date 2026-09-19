import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import Redirect from '../../../../src/view/route/Redirect.jsx';
import * as HandlerUserLogin from '../../../../src/api/handler/handlerUserLogin.js';
import GETRequestPublic from '../../../../src/api/method/GETRequestPublic';

vi.mock('../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/api/handler/handlerUserLogin.js', () => ({
    handleUserLogin: vi.fn()
}));

// Mock LoginForm to avoid full form complexity in integration test
vi.mock('../../../../src/view/page/LoginForm', () => ({
    default: ({onLogin, loginError}) => (
        <div data-testid="login-root">
            <input data-testid="input-username" defaultValue="test@test.com"/>
            <input data-testid="input-password" defaultValue="Password123!"/>
            <button data-testid="submit-login"
                    onClick={() => onLogin({email: 'test@test.com', password: 'Password123!'})}>
                Login
            </button>
            {loginError && <div data-testid="login-error">Wrong username or password</div>}
        </div>
    )
}));

const renderRedirect = (search = '') =>
    render(
        <MemoryRouter initialEntries={[`/redirect${search}`]}>
            <Routes>
                <Route path="/redirect" element={<Redirect/>}/>
            </Routes>
        </MemoryRouter>
    );

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Redirect - Integration Tests', () => {
    test('passes games and destination to handleUserLogin on login', async () => {
        const games = [{name: 'game1', pageUrl: 'url1'}];
        GETRequestPublic.mockResolvedValueOnce({success: true, data: games});

        renderRedirect('?destination=game1');

        // Wait for loading to finish and LoginForm to appear
        await waitFor(() => expect(screen.getByTestId('submit-login')).toBeInTheDocument());

        // Mock handleUserLogin success
        HandlerUserLogin.handleUserLogin.mockImplementation(async (data, games, dest, navigate, setError) => {
            const gameToRedirect = games.find(g => g.name === dest);
            if (gameToRedirect) {
                // In a real environment this would be window.location.href
                return;
            }
        });

        const loginButton = screen.getByTestId('submit-login');
        await userEvent.click(loginButton);

        expect(HandlerUserLogin.handleUserLogin).toHaveBeenCalledWith(
            {email: 'test@test.com', password: 'Password123!'},
            games,
            'game1',
            expect.any(Function), // navigate
            expect.any(Function)  // setLoginError
        );
    });

    test('warns when games are not loaded but destination is present', async () => {
        GETRequestPublic.mockResolvedValueOnce({success: true, data: []}); // Empty games
        GETRequestPublic.mockResolvedValueOnce({success: true, data: [{name: 'game1', pageUrl: 'url1'}]}); // Reload games

        renderRedirect('?destination=game1');

        await waitFor(() => expect(GETRequestPublic).toHaveBeenCalled());
        // Wait for loading to finish
        await waitFor(() => expect(screen.getByTestId('submit-login')).toBeInTheDocument());

        const loginButton = screen.getByTestId('submit-login');
        await userEvent.click(loginButton);

        await waitFor(() => expect(GETRequestPublic).toHaveBeenCalledTimes(2));
        expect(HandlerUserLogin.handleUserLogin).toHaveBeenCalledWith(
            {email: 'test@test.com', password: 'Password123!'},
            [{name: 'game1', pageUrl: 'url1'}],
            'game1',
            expect.any(Function),
            expect.any(Function)
        );
    });
});
