import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NationalityFetchData from '../../../../../src/api/components/geters/NationalityFetchData';

vi.mock('../../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn(),
}));

import GETRequestPublic from '../../../../../src/api/method/GETRequestPublic';

const MOCK_NATIONALITIES = [
    { id: '3', name: 'Polish' },
    { id: '1', name: 'British' },
    { id: '2', name: 'French' },
];

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('NationalityFetchData – integration', () => {
    it('renders sorted nationality options fetched from the API', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_NATIONALITIES });

        render(<NationalityFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'British' })).toBeInTheDocument()
        );

        const options = screen.getAllByRole('option').map((o) => o.textContent);
        // Sorted alphabetically: British, French, Polish (plus leading "Select")
        expect(options).toEqual(['Select', 'British', 'French', 'Polish']);
    });

    it('shows validation hint before the user makes a selection', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_NATIONALITIES });

        render(<NationalityFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'British' })).toBeInTheDocument()
        );

        expect(screen.getByText('Select your nationality from list.')).toBeInTheDocument();
    });

    it('hides validation hint and calls onChange after the user selects a nationality', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_NATIONALITIES });
        const onChange = vi.fn();

        render(<NationalityFetchData onChange={onChange} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Polish' })).toBeInTheDocument()
        );

        await userEvent.selectOptions(screen.getByRole('combobox'), '3');

        expect(onChange).toHaveBeenCalledWith('3');
        expect(screen.queryByText('Select your nationality from list.')).not.toBeInTheDocument();
    });

    it('shows error span when the API call fails', async () => {
        GETRequestPublic.mockResolvedValue({
            success: false,
            message: 'Service unavailable',
        });

        render(<NationalityFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByText('Error loading nationalities.')).toBeInTheDocument()
        );

        expect(screen.getByRole('option', { name: 'Error loading data' })).toBeInTheDocument();
    });

    it('shows error span when GETRequestPublic throws', async () => {
        GETRequestPublic.mockRejectedValue(new Error('Network failure'));

        render(<NationalityFetchData onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByText('Error loading nationalities.')).toBeInTheDocument()
        );
    });
});
