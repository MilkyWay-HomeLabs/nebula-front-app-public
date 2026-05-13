import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordChange from '../../../../src/view/subpage/PasswordChange.jsx';
import * as ChangePasswordRequest from '../../../../src/api/password/ChangePasswordRequest.js';

vi.mock('../../../../src/api/password/ChangePasswordRequest.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        getUserId: vi.fn(() => 42)
    }
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe('PasswordChange - Integration Tests', () => {
    test('should send password change request and clear form on success', async () => {
        ChangePasswordRequest.default.mockResolvedValue({success: true});
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<PasswordChange/>);
        const form = within(container);

        const currentPasswordInput = form.getByTestId('current-password-input');
        const newPasswordInput = form.getByTestId('new-password-input');
        const confirmPasswordInput = form.getByTestId('confirm-password-input');

        await userEvent.type(currentPasswordInput, 'CurrentPass123!');
        await userEvent.type(newPasswordInput, 'NewStrongPass123!');
        await userEvent.type(confirmPasswordInput, 'NewStrongPass123!');

        await userEvent.click(form.getByRole('button', {name: /Change password/i}));

        await waitFor(() => {
            expect(ChangePasswordRequest.default).toHaveBeenCalledWith({
                userId: 42,
                currentPassword: 'CurrentPass123!',
                newPassword: 'NewStrongPass123!',
                confirmPassword: 'NewStrongPass123!'
            });
        });

        await waitFor(() => {
            expect(currentPasswordInput).toHaveValue('');
            expect(newPasswordInput).toHaveValue('');
            expect(confirmPasswordInput).toHaveValue('');
            expect(window.alert).toHaveBeenCalledWith('Password updated');
        });
    });

    test('should show error alert when backend returns unsuccessful result', async () => {
        ChangePasswordRequest.default.mockResolvedValue({success: false});
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<PasswordChange/>);
        const form = within(container);

        await userEvent.type(form.getByTestId('current-password-input'), 'CurrentPass123!');
        await userEvent.type(form.getByTestId('new-password-input'), 'NewStrongPass123!');
        await userEvent.type(form.getByTestId('confirm-password-input'), 'NewStrongPass123!');

        await userEvent.click(form.getByRole('button', {name: /Change password/i}));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Something is wrong...');
        });
    });

    test('should not call API when confirmation password does not match', async () => {
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<PasswordChange/>);
        const form = within(container);

        await userEvent.type(form.getByTestId('current-password-input'), 'CurrentPass123!');
        await userEvent.type(form.getByTestId('new-password-input'), 'NewStrongPass123!');
        await userEvent.type(form.getByTestId('confirm-password-input'), 'Mismatch123!');

        await userEvent.click(form.getByRole('button', {name: /Change password/i}));

        expect(ChangePasswordRequest.default).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(
            'Incorrect form data. Ensure your password is strong and matches the confirmation.'
        );
    });
});