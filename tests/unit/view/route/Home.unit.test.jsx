import React from 'react';
import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import Home from '../../../../src/view/route/Home.jsx';

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        loadUserData: vi.fn(() => null),
        saveUserData: vi.fn(() => Promise.resolve(true)),
        fetchUserData: vi.fn(() => Promise.resolve(true)),
        clearUserData: vi.fn()
    }
}));

vi.mock('../../../../src/data/UserAvatar.js', () => ({
    default: {
        fetchAndSaveUserAvatar: vi.fn(() => Promise.resolve(null)),
        updateAvatar: vi.fn(() => Promise.resolve())
    }
}));

vi.mock('../../../../src/api/account/LoginUserRequest.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/api/account/RegistrationRequest.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/api/user/UserDataRequest.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/view/component/Menu.jsx', () => ({
    default: ({onSubNavigate}) => (
        <nav data-testid="menu-stub">
            <button onClick={() => onSubNavigate('games')}>Games</button>
            <button onClick={() => onSubNavigate('profileEditor')}>Profile Editor</button>
            <button onClick={() => onSubNavigate('profileSettings')}>User Settings</button>
            <button onClick={() => onSubNavigate('achievements')}>Achievements</button>
            <button onClick={() => onSubNavigate('passwordChange')}>Password</button>
        </nav>
    )
}));

vi.mock('../../../../src/view/subpage/Games.jsx', () => ({
    default: () => <div data-testid="games-stub"/>
}));
vi.mock('../../../../src/view/subpage/Achievements.jsx', () => ({
    default: () => <div data-testid="achievements-stub"/>
}));
vi.mock('../../../../src/view/subpage/ProfileEditor.jsx', () => ({
    default: () => <div data-testid="profile-editor-stub"/>
}));
vi.mock('../../../../src/view/subpage/ProfileSettings.jsx', () => ({
    default: () => <div data-testid="profile-settings-stub"/>
}));
vi.mock('../../../../src/view/subpage/PasswordChange.jsx', () => ({
    default: () => <div data-testid="password-change-stub"/>
}));

const renderHome = () =>
    render(
        <MemoryRouter>
            <Home/>
        </MemoryRouter>
    );

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
});

test('shows login form when user is not logged in', async () => {
    renderHome();
    const body = within(document.body);

    await waitFor(() => {
        expect(body.getByTestId('login-root')).toBeInTheDocument();
    });
});

test('shows games after successful login', async () => {
    const {default: LoginUserRequest} = await import('../../../../src/api/account/LoginUserRequest.js');
    const {default: UserDataRequest} = await import('../../../../src/api/user/UserDataRequest.js');

    LoginUserRequest.mockResolvedValue({success: true, token: 'fake-token'});
    UserDataRequest.mockResolvedValue({id: 1, login: 'testuser'});

    renderHome();
    const body = within(document.body);

    await waitFor(() => expect(body.getByTestId('login-root')).toBeInTheDocument());

    await userEvent.type(body.getByTestId('input-username'), 'test@example.com');
    await userEvent.type(body.getByTestId('input-password'), 'StrongPass123!');
    await userEvent.click(body.getByTestId('submit-login'));

    await waitFor(() => {
        expect(body.getByTestId('menu-stub')).toBeInTheDocument();
        expect(body.getByTestId('games-stub')).toBeInTheDocument();
    });
});

test('shows login error when credentials are wrong', async () => {
    const {default: LoginUserRequest} = await import('../../../../src/api/account/LoginUserRequest.js');
    LoginUserRequest.mockResolvedValue({success: false});

    renderHome();
    const body = within(document.body);

    await waitFor(() => expect(body.getByTestId('login-root')).toBeInTheDocument());

    await userEvent.type(body.getByTestId('input-username'), 'test@example.com');
    await userEvent.type(body.getByTestId('input-password'), 'StrongPass123!');
    await userEvent.click(body.getByTestId('submit-login'));

    await waitFor(() => {
        expect(body.getByTestId('login-error')).toBeInTheDocument();
    });
});

test('restores session from localStorage on mount', async () => {
    const {default: UserData} = await import('../../../../src/data/UserData.js');
    UserData.loadUserData.mockReturnValueOnce({id: 42, login: 'stored_user'});

    renderHome();
    const body = within(document.body);

    await waitFor(() => {
        expect(body.getByTestId('menu-stub')).toBeInTheDocument();
    });
});

test('navigates to subpages via menu', async () => {
    const {default: UserData} = await import('../../../../src/data/UserData.js');
    UserData.loadUserData.mockReturnValueOnce({id: 1, login: 'testuser'});

    renderHome();
    const body = within(document.body);

    await waitFor(() => expect(body.getByTestId('games-stub')).toBeInTheDocument());

    await userEvent.click(body.getByRole('button', {name: /Achievements/i}));
    await waitFor(() => expect(body.getByTestId('achievements-stub')).toBeInTheDocument());

    await userEvent.click(body.getByRole('button', {name: /Profile Editor/i}));
    await waitFor(() => expect(body.getByTestId('profile-editor-stub')).toBeInTheDocument());

    await userEvent.click(body.getByRole('button', {name: /User Settings/i}));
    await waitFor(() => expect(body.getByTestId('profile-settings-stub')).toBeInTheDocument());

    await userEvent.click(body.getByRole('button', {name: /Password/i}));
    await waitFor(() => expect(body.getByTestId('password-change-stub')).toBeInTheDocument());
});