import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NationalityFetchData from '../../../../../src/api/components/geters/NationalityFetchData';

vi.mock('../../../../../src/api/components/UseFetchSortedData', () => ({
    default: vi.fn(),
}));

import useFetchSortedData from '../../../../../src/api/components/UseFetchSortedData';

const MOCK_NATIONALITIES = [
    { id: '1', name: 'British' },
    { id: '2', name: 'French' },
    { id: '3', name: 'Polish' },
];

afterEach(() => cleanup());

describe('NationalityFetchData – unit', () => {
    beforeEach(() => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_NATIONALITIES,
            selected: '',
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
    });

    it('renders a label with text "Nationality:"', () => {
        render(<NationalityFetchData onChange={vi.fn()} />);
        expect(screen.getByText(/nationality:/i)).toBeInTheDocument();
    });

    it('renders all options returned by the hook', () => {
        render(<NationalityFetchData onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'British' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'French' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Polish' })).toBeInTheDocument();
    });

    it('shows default "Select" placeholder option when there is no error', () => {
        render(<NationalityFetchData onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Select' })).toBeInTheDocument();
    });

    it('shows "Select your nationality from list." hint when nothing is selected', () => {
        render(<NationalityFetchData onChange={vi.fn()} />);
        expect(screen.getByText('Select your nationality from list.')).toBeInTheDocument();
    });

    it('does not show hint when a nationality is already selected', () => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_NATIONALITIES,
            selected: '3',
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
        render(<NationalityFetchData onChange={vi.fn()} />);
        expect(screen.queryByText('Select your nationality from list.')).not.toBeInTheDocument();
    });

    it('calls onChange and setSelected when the user picks an option', async () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_NATIONALITIES,
            selected: '',
            setSelected,
            error: null,
            isLoading: false,
        });

        render(<NationalityFetchData onChange={onChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox'), '1');

        expect(setSelected).toHaveBeenCalledWith('1');
        expect(onChange).toHaveBeenCalledWith('1');
    });

    it('shows "Error loading data" placeholder and error span when hook returns an error', () => {
        useFetchSortedData.mockReturnValue({
            data: [],
            selected: '',
            setSelected: vi.fn(),
            error: 'Timeout',
            isLoading: false,
        });
        render(<NationalityFetchData onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Error loading data' })).toBeInTheDocument();
        expect(screen.getByText('Error loading nationalities.')).toBeInTheDocument();
    });
});
