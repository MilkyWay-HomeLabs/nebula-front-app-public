// tests/integration/view/page/RegistrationForm.integration.test.jsx
import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
// --- TEST IMPLEMENTATION ---
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '../../../../src/view/page/RegistrationForm.jsx';
import * as RegistrationRequest from '../../../../src/api/account/RegistrationRequest.js';

// --- MODULE MOCKS (declared before importing the component under test) ---
// Mock the default export of the registration API module
vi.mock('../../../../src/api/account/RegistrationRequest.js', () => ({
    default: vi.fn()
}));

// Mock nationality fetcher component to call onChange with a numeric id
vi.mock('../../../../src/api/components/geters/NationalityFetchData.jsx', () => ({
    default: ({onChange}) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => onChange(1), [onChange]);
        return null;
    }
}));

// Mock gender fetcher component to call onChange with a numeric id
vi.mock('../../../../src/api/components/geters/GenderFetchData.jsx', () => ({
    default: ({onChange}) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => onChange(1), [onChange]);
        return null;
    }
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('RegistrationForm - Integration Tests', () => {
    test('should submit valid registration data successfully', async () => {
        // Ensure the mocked RegistrationRequest resolves as if API succeeded
        RegistrationRequest.default.mockResolvedValue({
            statusCode: 201,
            message: 'User registered'
        });

        const onRegister = vi.fn();
        const onNavigate = vi.fn();

        const {container} = render(
            <RegistrationForm onRegister={onRegister} onNavigate={onNavigate}/>
        );

        const form = within(container);

        const loginInput = form.getByLabelText(/Your login:/i);
        const emailInput = form.getByLabelText(/^Email:/i);
        const passwordInput = form.getByLabelText(/Your Password:/i);
        const repeatPasswordInput = form.getByLabelText(/Repeat password:/i);

        await userEvent.type(loginInput, 'testuser123');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'SecurePass123!');
        await userEvent.type(repeatPasswordInput, 'SecurePass123!');

        // Stub global alert to avoid jsdom "Not implemented" issues
        vi.stubGlobal('alert', vi.fn());

        const submitBtn = form.getByRole('button', {name: /Register Account/i});

        await userEvent.click(submitBtn);

        await waitFor(() => {
            expect(onRegister).toHaveBeenCalledWith(
                expect.objectContaining({
                    login: 'testuser123',
                    email: 'test@example.com'
                })
            );
        });
    });

    test('should not submit when required fields are empty', async () => {
        const onRegister = vi.fn();

        const {container} = render(
            <RegistrationForm onRegister={onRegister} onNavigate={vi.fn()}/>
        );

        const form = within(container);
        const submitBtn = form.getByRole('button', {name: /Register Account/i});

        vi.stubGlobal('alert', vi.fn());

        await userEvent.click(submitBtn);

        expect(onRegister).not.toHaveBeenCalled();
    });

    test('should show password validation errors', async () => {
        const {container} = render(
            <RegistrationForm onRegister={vi.fn()} onNavigate={vi.fn()}/>
        );

        const form = within(container);
        const passwordInput = form.getByLabelText(/Your Password:/i);

        await userEvent.type(passwordInput, 'weak');
        await userEvent.tab(); // blur the field to trigger validation

        expect(
            form.getByText(/The password must contain at least 8 characters/i)
        ).toBeInTheDocument();
    });
});
