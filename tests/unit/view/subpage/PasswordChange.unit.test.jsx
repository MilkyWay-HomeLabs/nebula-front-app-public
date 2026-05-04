import React from 'react';
import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordChange from '../../../../src/view/subpage/PasswordChange.jsx';
import * as ChangePasswordRequest from '../../../../src/api/password/ChangePasswordRequest.js';

vi.mock('../../../../src/api/password/ChangePasswordRequest.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        getUserId: vi.fn(() => 123)
    }
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

test('renders password change form', () => {
    render(<PasswordChange/>);
    const form = within(document.body);

    expect(form.getByTestId('password-change-root')).toBeInTheDocument();
    expect(form.getByTestId('password-change-form')).toBeInTheDocument();
    expect(form.getByTestId('current-password-input')).toBeInTheDocument();
    expect(form.getByTestId('new-password-input')).toBeInTheDocument();
    expect(form.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(form.getByTestId('change-password-button')).toBeInTheDocument();
});

test('toggles current password visibility', async () => {
    render(<PasswordChange/>);
    const form = within(document.body);

    const input = form.getByTestId('current-password-input');
    const toggle = form.getByLabelText(/Show current password/i);

    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
});

test('shows validation message for weak new password', async () => {
    render(<PasswordChange/>);
    const form = within(document.body);

    await userEvent.type(form.getByTestId('new-password-input'), 'weak');

    expect(
        form.getByText(/The password must contain at least 8 characters, numbers and letters/i)
    ).toBeInTheDocument();
});

test('shows validation message when passwords do not match', async () => {
    render(<PasswordChange/>);
    const form = within(document.body);

    await userEvent.type(form.getByTestId('new-password-input'), 'StrongPass123!');
    await userEvent.type(form.getByTestId('confirm-password-input'), 'DifferentPass123!');

    expect(form.getByText(/Passwords must match/i)).toBeInTheDocument();
});

test('shows alert and does not call API for invalid form', async () => {
    vi.stubGlobal('alert', vi.fn());

    render(<PasswordChange/>);
    const form = within(document.body);

    await userEvent.type(form.getByTestId('current-password-input'), 'weak');
    await userEvent.type(form.getByTestId('new-password-input'), 'weak');
    await userEvent.type(form.getByTestId('confirm-password-input'), 'weak');

    await userEvent.click(form.getByTestId('change-password-button'));

    expect(ChangePasswordRequest.default).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
        'Incorrect form data. Ensure your password is strong and matches the confirmation.'
    );
});

test('submits valid form and resets fields on success', async () => {
    ChangePasswordRequest.default.mockResolvedValue({success: true});
    vi.stubGlobal('alert', vi.fn());

    render(<PasswordChange/>);
    const form = within(document.body);

    const currentInput = form.getByTestId('current-password-input');
    const newInput = form.getByTestId('new-password-input');
    const confirmInput = form.getByTestId('confirm-password-input');

    await userEvent.type(currentInput, 'CurrentPass123!');
    await userEvent.type(newInput, 'StrongPass123!');
    await userEvent.type(confirmInput, 'StrongPass123!');

    await userEvent.click(form.getByTestId('change-password-button'));

    await waitFor(() => {
        expect(ChangePasswordRequest.default).toHaveBeenCalledWith({
            userId: 123,
            currentPassword: 'CurrentPass123!',
            newPassword: 'StrongPass123!',
            confirmPassword: 'StrongPass123!'
        });
    });

    await waitFor(() => {
        expect(currentInput).toHaveValue('');
        expect(newInput).toHaveValue('');
        expect(confirmInput).toHaveValue('');
        expect(window.alert).toHaveBeenCalledWith('Password updated');
    });
});

test('shows error alert when API returns unsuccessful result', async () => {
    ChangePasswordRequest.default.mockResolvedValue({success: false});
    vi.stubGlobal('alert', vi.fn());

    render(<PasswordChange/>);
    const form = within(document.body);

    await userEvent.type(form.getByTestId('current-password-input'), 'CurrentPass123!');
    await userEvent.type(form.getByTestId('new-password-input'), 'StrongPass123!');
    await userEvent.type(form.getByTestId('confirm-password-input'), 'StrongPass123!');

    await userEvent.click(form.getByTestId('change-password-button'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Something is wrong...');
    });
});

test('shows error alert when API throws', async () => {
    ChangePasswordRequest.default.mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {
    });

    render(<PasswordChange/>);
    const form = within(document.body);

    await userEvent.type(form.getByTestId('current-password-input'), 'CurrentPass123!');
    await userEvent.type(form.getByTestId('new-password-input'), 'StrongPass123!');
    await userEvent.type(form.getByTestId('confirm-password-input'), 'StrongPass123!');

    await userEvent.click(form.getByTestId('change-password-button'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Something is wrong...');
    });
});