import React from 'react';
import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import ConfirmationAccount from '../../../../src/view/route/ConfirmationAccount.jsx';
import * as ConfirmationTokenRequest from '../../../../src/api/account/ConfirmationTokenRequest.js';

vi.mock('../../../../src/api/account/ConfirmationTokenRequest.js', () => ({
    default: vi.fn()
}));

// assetUrl uses import.meta.env — stub the logo to avoid resolution errors
vi.mock('../../../../src/util/AssetUrl.js', () => ({
    assetUrl: vi.fn((name) => `/mocked/${name}`)
}));

const renderWithRoute = (id = '42', token = 'abc123token') =>
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

test('renders confirmation page with id and truncated token', () => {
    const longToken = 'ABCDEFGHIJ_MIDDLE_CONTENT_KLMNOPQRST';
    renderWithRoute('42', longToken);
    const body = within(document.body);

    expect(body.getByText(/Account confirmation/i)).toBeInTheDocument();
    expect(body.getByText(/ID: 42/i)).toBeInTheDocument();
    // Long token should be truncated: first 10 + '...' + last 10
    expect(body.getByText(/ABCDEFGHIJ\.\.\.KLMNOPQRST/)).toBeInTheDocument();
    expect(body.getByRole('button', {name: /Confirm Account/i})).toBeInTheDocument();
});

test('renders short token without truncation', () => {
    renderWithRoute('1', 'shorttoken');
    const body = within(document.body);

    expect(body.getByText(/Token: shorttoken/i)).toBeInTheDocument();
});

test('shows success alert and redirects on successful confirmation', async () => {
    ConfirmationTokenRequest.default.mockResolvedValue({success: true});
    vi.stubGlobal('alert', vi.fn());

    // Stub window.location.href setter
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: '',
        set href(v) {
        }
    });

    renderWithRoute('42', 'validtoken');
    const body = within(document.body);

    await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

    await waitFor(() => {
        expect(ConfirmationTokenRequest.default).toHaveBeenCalledWith({
            tokenId: 42,
            token: 'validtoken'
        });
        expect(window.alert).toHaveBeenCalledWith('The account has been confirmed');
    });

    locationSpy.mockRestore();
});

test('shows failure alert when confirmation returns unsuccessful', async () => {
    ConfirmationTokenRequest.default.mockResolvedValue({
        success: false,
        message: 'Token expired'
    });
    vi.stubGlobal('alert', vi.fn());

    renderWithRoute('42', 'expiredtoken');
    const body = within(document.body);

    await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Confirmation failed: Token expired');
    });
});

test('shows error alert when API throws', async () => {
    ConfirmationTokenRequest.default.mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {
    });

    renderWithRoute('42', 'sometoken');
    const body = within(document.body);

    await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
            'An error occurred during account confirmation. Please try again.'
        );
    });
});

test('parses id correctly as integer in request payload', async () => {
    ConfirmationTokenRequest.default.mockResolvedValue({success: true});
    vi.stubGlobal('alert', vi.fn());

    renderWithRoute('99', 'mytoken');
    const body = within(document.body);

    await userEvent.click(body.getByRole('button', {name: /Confirm Account/i}));

    await waitFor(() => {
        expect(ConfirmationTokenRequest.default).toHaveBeenCalledWith({
            tokenId: 99,     // must be number, not string
            token: 'mytoken'
        });
    });
});
