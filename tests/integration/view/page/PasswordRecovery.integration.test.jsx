import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordRecovery from '../../../../src/view/page/PasswordRecovery.jsx';
import * as ResetPasswordRequest from '../../../../src/api/password/ResetPasswordRequest.js';

vi.mock('../../../../src/api/password/ResetPasswordRequest.js', () => ({
    default: vi.fn()
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('PasswordRecovery - Integration Tests', () => {
    test('should trigger ResetPasswordRequest and show success UI', async () => {
        ResetPasswordRequest.default.mockResolvedValue({success: true});

        const {container} = render(<PasswordRecovery onNavigate={vi.fn()}/>);
        const form = within(container);

        const emailInput = form.getByLabelText(/Email:/i);
        await userEvent.type(emailInput, 'recovery@example.com');

        const submitBtn = form.getByRole('button', {name: /Reset password/i});
        await userEvent.click(submitBtn);

        await waitFor(() => {
            expect(ResetPasswordRequest.default).toHaveBeenCalledWith('recovery@example.com');
            expect(form.getByText(/A link to restore your password has been sent/i)).toBeInTheDocument();
        });
    });

    test('should handle API failure gracefully', async () => {
        ResetPasswordRequest.default.mockRejectedValue(new Error('Network failure'));
        vi.stubGlobal('alert', vi.fn());
        vi.spyOn(console, 'error').mockImplementation(() => {
        });

        const {container} = render(<PasswordRecovery onNavigate={vi.fn()}/>);
        const form = within(container);

        await userEvent.type(form.getByLabelText(/Email:/i), 'fail@example.com');
        await userEvent.click(form.getByRole('button', {name: /Reset password/i}));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to send recovery link'));
        });
    });
});
