import React from 'react';
import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Redirect from '../../../../src/view/route/Redirect.jsx';
import GETRequestPublic from '../../../../src/api/method/GETRequestPublic';

vi.mock('../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/api/handler/handlerUserLogin.js', () => ({
    handleUserLogin: vi.fn()
}));

vi.mock('../../../../src/view/page/LoginForm', () => ({
    default: ({onLogin, loginError}) => (
        <div data-testid="login-form-stub">
            <button data-testid="login-button"
                    onClick={() => onLogin({email: 'test@test.com', password: 'Password123!'})}>
                Login
            </button>
            {loginError && <div data-testid="login-error">Error</div>}
        </div>
    )
}));

const renderRedirect = (search = '') =>
    render(
        <MemoryRouter initialEntries={[`/redirect${search}`]}>
            <Redirect/>
        </MemoryRouter>
    );

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

test('renders LoginForm on mount', () => {
    GETRequestPublic.mockResolvedValueOnce({success: true, data: []});
    renderRedirect();
    expect(screen.getByTestId('login-form-stub')).toBeInTheDocument();
});

test('fetches enabled games on mount', async () => {
    GETRequestPublic.mockResolvedValueOnce({success: true, data: [{name: 'game1', pageUrl: 'url1'}]});

    renderRedirect();

    await waitFor(() => {
        expect(GETRequestPublic).toHaveBeenCalled();
    });
});

test('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
    });
    GETRequestPublic.mockRejectedValueOnce(new Error('Fetch failed'));

    renderRedirect();

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching enabled games:', expect.any(Error));
    });
    consoleSpy.mockRestore();
});
