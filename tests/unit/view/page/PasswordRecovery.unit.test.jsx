import React from 'react';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordRecovery from '../../../../src/view/page/PasswordRecovery';
import {afterEach, expect, test, vi} from 'vitest';
import * as ResetPasswordRequest from '../../../../src/api/password/ResetPasswordRequest';

vi.mock('../../../../src/api/password/ResetPasswordRequest', () => ({
    default: vi.fn()
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

test('shows success message after successful recovery request', async () => {
    ResetPasswordRequest.default.mockResolvedValue({success: true});

    render(<PasswordRecovery onNavigate={vi.fn()}/>);
    const form = within(document.body);

    const emailInput = form.getByLabelText(/Email:/i);
    await userEvent.type(emailInput, 'test@example.com');

    await userEvent.click(form.getByRole('button', {name: /Reset password/i}));

    await waitFor(() => {
        expect(form.getByText(/A link to restore your password has been sent/i)).toBeInTheDocument();
    });
});

test('shows validation error for invalid email', async () => {
    render(<PasswordRecovery onNavigate={vi.fn()}/>);
    const form = within(document.body);

    const emailInput = form.getByLabelText(/Email:/i);
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab();

    expect(form.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
});

test('shows alert on API failure', async () => {
    ResetPasswordRequest.default.mockRejectedValue(new Error('API Error'));
    vi.stubGlobal('alert', vi.fn());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
    });

    render(<PasswordRecovery onNavigate={vi.fn()}/>);
    const form = within(document.body);

    await userEvent.type(form.getByLabelText(/Email:/i), 'test@example.com');
    await userEvent.click(form.getByRole('button', {name: /Reset password/i}));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to send recovery link'));
        expect(consoleSpy).toHaveBeenCalled();
    });
});

test('calls onNavigate when clicking links', async () => {
    const onNavigate = vi.fn();
    render(<PasswordRecovery onNavigate={onNavigate}/>);
    const form = within(document.body);

    await userEvent.click(form.getByText(/Login/i));
    expect(onNavigate).toHaveBeenCalledWith('login');

    await userEvent.click(form.getByText(/Create account/i));
    expect(onNavigate).toHaveBeenCalledWith('register');
});
