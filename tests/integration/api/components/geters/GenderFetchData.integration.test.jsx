import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenderFetchData from '../../../../../src/api/components/geters/GenderFetchData';

vi.mock('../../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn(),
}));

import GETRequestPublic from '../../../../../src/api/method/GETRequestPublic';

const MOCK_GENDERS = [
    { id: '2', name: 'Male' },
    { id: '1', name: 'Female' },
    { id: '3', name: 'Other' },
];

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('GenderFetchData – integration', () => {
    it('renders sorted gender options fetched from the API', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_GENDERS });

        render(<GenderFetchData onChange={vi.fn()} />);

        // Options should appear after the async fetch resolves
        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
        });

        const options = screen.getAllByRole('option').map((o) => o.textContent);
        // Sorted alphabetically: Female, Male, Other (plus leading "Select")
        expect(options).toEqual(['Select', 'Female', 'Male', 'Other']);
    });

    it('shows validation hint before the user makes a selection', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_GENDERS });

        render(<GenderFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument()
        );

        expect(screen.getByText('Select your gender.')).toBeInTheDocument();
    });

    it('hides validation hint and calls onChange after the user selects a gender', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_GENDERS });
        const onChange = vi.fn();

        render(<GenderFetchData onChange={onChange} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument()
        );

        await userEvent.selectOptions(screen.getByRole('combobox'), '2');

        expect(onChange).toHaveBeenCalledWith('2');
        expect(screen.queryByText('Select your gender.')).not.toBeInTheDocument();
    });

    it('shows error span when the API call fails', async () => {
        GETRequestPublic.mockResolvedValue({
            success: false,
            message: 'Internal server error',
        });

        render(<GenderFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByText('Error loading genders.')).toBeInTheDocument()
        );

        expect(screen.getByRole('option', { name: 'Error loading data' })).toBeInTheDocument();
    });

    it('shows error span when GETRequestPublic throws', async () => {
        GETRequestPublic.mockRejectedValue(new Error('Network failure'));

        render(<GenderFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByText('Error loading genders.')).toBeInTheDocument()
        );
    });
});
