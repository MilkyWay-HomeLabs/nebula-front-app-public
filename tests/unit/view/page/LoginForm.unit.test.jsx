import React from 'react';
import {cleanup, render, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../../../src/view/page/LoginForm';
import {afterEach, expect, test, vi} from 'vitest';

afterEach(() => cleanup());

test('calls onLogin when form is valid', async () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} loginError={false} onNavigate={vi.fn()}/>);

    const form = within(document.body);

    await userEvent.type(form.getByLabelText(/Username or email:/i), 'test@example.com');
    await userEvent.type(form.getByLabelText(/Password:/i), 'StrongPass123!');

    await userEvent.click(form.getByRole('button', {name: /Login/i}));

    expect(onLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'StrongPass123!'
    });
});

test('shows validation error for invalid email', async () => {
    render(<LoginForm onLogin={vi.fn()} loginError={false} onNavigate={vi.fn()}/>);

    const form = within(document.body);
    const input = form.getByLabelText(/Username or email:/i);

    await userEvent.type(input, 'ab'); // za krótki login
    await userEvent.tab();

    expect(form.getByText(/Please enter a valid email address or username\./i)).toBeInTheDocument();
});

test('toggles password visibility', async () => {
    render(<LoginForm onLogin={vi.fn()} loginError={false} onNavigate={vi.fn()}/>);

    const form = within(document.body);
    const passwordInput = form.getByLabelText(/Password:/i);
    const toggleBtn = form.getByLabelText(/Show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
});

test('displays login error message when loginError is true', () => {
    render(<LoginForm onLogin={vi.fn()} loginError={true} onNavigate={vi.fn()}/>);
    expect(within(document.body).getByText(/Wrong username or password/i)).toBeInTheDocument();
});

test('calls onNavigate when clicking links', async () => {
    const onNavigate = vi.fn();
    render(<LoginForm onLogin={vi.fn()} loginError={false} onNavigate={onNavigate}/>);

    const form = within(document.body);

    await userEvent.click(form.getByText(/Create account/i));
    expect(onNavigate).toHaveBeenCalledWith('register');

    await userEvent.click(form.getByText(/Restore it/i));
    expect(onNavigate).toHaveBeenCalledWith('recovery');
});
