import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import ConfirmationAccount from '../../../../src/view/route/ConfirmationAccount.jsx';
import * as ConfirmationTokenRequest from '../../../../src/api/account/ConfirmationTokenRequest.js';

vi.mock('../../../../src/api/account/ConfirmationTokenRequest.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/util/AssetUrl.js', () => ({
    assetUrl: vi.fn((name) => `/mocked/${name}`)
}));

const renderWithRoute = (id = '10', token = 'testtoken') =>
    render(
        <MemoryRouter initialEntries={[`/confirm/${id}/${token}`]}>
            <Routes>
                <Route path="/confirm/:id/:token" element={<ConfirmationAccount/>}/>
            </Routes>
        </MemoryRouter>
    );

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe('ConfirmationAccount - Integration Tests', () => {
    test('full success flow: calls API with correct data, shows alert', async () => {
        ConfirmationTokenRequest.default.mockResolvedValue({success: true});
        vi.stubGlobal('alert', vi.fn());

        renderWithRoute('7', 'realtoken123');
        const body = within(document.body);

        expect(body.getByText(/ID: 7/)).toBeInTheDocument();

        await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

        await waitFor(() => {
            expect(ConfirmationTokenRequest.default).toHaveBeenCalledTimes(1);
            expect(ConfirmationTokenRequest.default).toHaveBeenCalledWith({
                tokenId: 7,
                token: 'realtoken123'
            });
            expect(window.alert).toHaveBeenCalledWith('The account has been confirmed');
        });
    });

    test('failure flow: shows message from API response', async () => {
        ConfirmationTokenRequest.default.mockResolvedValue({
            success: false,
            message: 'Invalid token'
        });
        vi.stubGlobal('alert', vi.fn());
        vi.spyOn(console, 'error').mockImplementation(() => {
        });

        renderWithRoute('3', 'badtoken');
        const body = within(document.body);

        await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

        await waitFor(() => {
            expect(ConfirmationTokenRequest.default).toHaveBeenCalledTimes(1);
            expect(window.alert).toHaveBeenCalledWith('Confirmation failed: Invalid token');
        });
    });

    test('failure flow: shows generic message when API response has no message', async () => {
        ConfirmationTokenRequest.default.mockResolvedValue({success: false});
        vi.stubGlobal('alert', vi.fn());
        vi.spyOn(console, 'error').mockImplementation(() => {
        });

        renderWithRoute('3', 'badtoken');
        const body = within(document.body);

        await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Confirmation failed: Unknown error');
        });
    });

    test('network error flow: shows generic error alert', async () => {
        ConfirmationTokenRequest.default.mockRejectedValue(new Error('Timeout'));
        vi.stubGlobal('alert', vi.fn());
        vi.spyOn(console, 'error').mockImplementation(() => {
        });

        renderWithRoute('5', 'sometoken');
        const body = within(document.body);

        await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                'An error occurred during account confirmation. Please try again.'
            );
        });
    });
});