import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../../../src/view/page/LoginForm.jsx';

vi.mock('../../../../src/api/account/LoginUserRequest.js', () => ({
    default: vi.fn()
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('LoginForm - Integration Tests', () => {
    test('should call onLogin with correct data when form is submitted', async () => {
        const onLogin = vi.fn();
        const {container} = render(
            <LoginForm onLogin={onLogin} loginError={false} onNavigate={vi.fn()}/>
        );

        const form = within(container);

        await userEvent.type(form.getByLabelText(/Username or email:/i), 'user@example.com');
        await userEvent.type(form.getByLabelText(/Password:/i), 'SecurePass123!');

        await userEvent.click(form.getByRole('button', {name: /Login/i}));

        expect(onLogin).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'SecurePass123!'
        });
    });

    test('should not call onLogin when login is invalid (too short)', async () => {
        const onLogin = vi.fn();
        const {container} = render(
            <LoginForm onLogin={onLogin} loginError={false} onNavigate={vi.fn()}/>
        );

        const form = within(container);

        await userEvent.type(form.getByLabelText(/Username or email:/i), 'ab'); // za krótki login
        await userEvent.type(form.getByLabelText(/Password:/i), 'SecurePass123!');

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        });
        await userEvent.click(form.getByRole('button', {name: /Login/i}));

        expect(onLogin).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("Invalid login data criteria.");
    });

    test('should call onLogin when valid login (not email) is provided', async () => {
        const onLogin = vi.fn();
        const {container} = render(
            <LoginForm onLogin={onLogin} loginError={false} onNavigate={vi.fn()}/>
        );

        const form = within(container);

        await userEvent.type(form.getByLabelText(/Username or email:/i), 'validlogin'); // poprawny login
        await userEvent.type(form.getByLabelText(/Password:/i), 'SecurePass123!');

        await userEvent.click(form.getByRole('button', {name: /Login/i}));

        expect(onLogin).toHaveBeenCalledWith({
            email: 'validlogin',
            password: 'SecurePass123!'
        });
    });
});
