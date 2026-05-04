import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import Home from '../../../../src/view/route/Home.jsx';
import * as LoginUserRequest from '../../../../src/api/account/LoginUserRequest.js';
import * as UserDataRequest from '../../../../src/api/user/UserDataRequest.js';

vi.mock('../../../../src/api/account/LoginUserRequest.js', () => ({default: vi.fn()}));
vi.mock('../../../../src/api/account/RegistrationRequest.js', () => ({default: vi.fn()}));
vi.mock('../../../../src/api/user/UserDataRequest.js', () => ({default: vi.fn()}));

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

vi.mock('../../../../src/view/component/Menu.jsx', () => ({
    default: ({onNavigate, onSubNavigate}) => (
        <nav data-testid="menu-stub">
            <button onClick={() => onSubNavigate('games')}>Games</button>
            <button onClick={() => onNavigate('logout')}>Logout</button>
        </nav>
    )
}));

vi.mock('../../../../src/view/subpage/Games.jsx', () => ({default: () => <div data-testid="games-stub"/>}));
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

vi.mock('../../../../src/api/components/geters/NationalityFetchData.jsx', () => ({
    default: ({onChange}) => (
        <select data-testid="nationality-select-stub" onChange={(e) => onChange(e.target.value)}>
            <option value="PL">Poland</option>
        </select>
    )
}));

vi.mock('../../../../src/api/components/geters/GenderFetchData.jsx', () => ({
    default: ({onChange}) => (
        <select data-testid="gender-select-stub" onChange={(e) => onChange(e.target.value)}>
            <option value="M">Male</option>
        </select>
    )
}));

const renderHome = () =>
    render(<MemoryRouter><Home/></MemoryRouter>);

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
});

describe('Home - Integration Tests', () => {
    test('full login flow: authenticates, fetches user data, shows menu and games', async () => {
        LoginUserRequest.default.mockResolvedValue({success: true, token: 'jwt-token'});
        UserDataRequest.default.mockResolvedValue({id: 5, login: 'integuser'});

        renderHome();
        const body = within(document.body);

        await waitFor(() => expect(body.getByTestId('login-root')).toBeInTheDocument());

        await userEvent.type(body.getByTestId('input-username'), 'test@example.com');
        await userEvent.type(body.getByTestId('input-password'), 'StrongPass123!');
        await userEvent.click(body.getByTestId('submit-login'));

        await waitFor(() => {
            expect(LoginUserRequest.default).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'StrongPass123!'
            });
            expect(body.getByTestId('menu-stub')).toBeInTheDocument();
            expect(body.getByTestId('games-stub')).toBeInTheDocument();
        });
    });

    test('logout flow: clears session and shows login form', async () => {
        const {default: UserData} = await import('../../../../src/data/UserData.js');
        UserData.loadUserData.mockReturnValueOnce({id: 1, login: 'testuser'});

        renderHome();
        const body = within(document.body);

        await waitFor(() => expect(body.getByTestId('menu-stub')).toBeInTheDocument());

        await userEvent.click(body.getByRole('button', {name: /Logout/i}));

        await waitFor(() => {
            expect(UserData.clearUserData).toHaveBeenCalled();
            expect(body.getByTestId('login-root')).toBeInTheDocument();
        });
    });

    test('registration flow: navigates to registration page on link click', async () => {
        renderHome();
        const body = within(document.body);

        await waitFor(() => expect(body.getByTestId('login-root')).toBeInTheDocument());

        await userEvent.click(body.getByText(/Create account/i));

        await waitFor(() => {
            expect(body.getByTestId('registration-root')).toBeInTheDocument();
        });
    });

    test('failed login shows error state', async () => {
        LoginUserRequest.default.mockResolvedValue({success: false});

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
});
