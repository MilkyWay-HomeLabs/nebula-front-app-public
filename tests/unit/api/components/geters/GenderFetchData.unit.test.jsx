import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenderFetchData from '../../../../../src/api/components/geters/GenderFetchData';

vi.mock('../../../../../src/api/components/UseFetchSortedData', () => ({
    default: vi.fn(),
}));

import useFetchSortedData from '../../../../../src/api/components/UseFetchSortedData';

const MOCK_GENDERS = [
    { id: '1', name: 'Female' },
    { id: '2', name: 'Male' },
    { id: '3', name: 'Other' },
];

afterEach(() => cleanup());

describe('GenderFetchData – unit', () => {
    beforeEach(() => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_GENDERS,
            selected: '',
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
    });

    it('renders a label with text "Gender:"', () => {
        render(<GenderFetchData onChange={vi.fn()} />);
        expect(screen.getByText(/gender:/i)).toBeInTheDocument();
    });

    it('renders all options returned by the hook', () => {
        render(<GenderFetchData onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
    });

    it('shows default "Select" placeholder option when there is no error', () => {
        render(<GenderFetchData onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Select' })).toBeInTheDocument();
    });

    it('shows "Select your gender." hint when nothing is selected', () => {
        render(<GenderFetchData onChange={vi.fn()} />);
        expect(screen.getByText('Select your gender.')).toBeInTheDocument();
    });

    it('does not show hint when a gender is already selected', () => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_GENDERS,
            selected: '1',
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
        render(<GenderFetchData onChange={vi.fn()} />);
        expect(screen.queryByText('Select your gender.')).not.toBeInTheDocument();
    });

    it('calls onChange and setSelected when the user picks an option', async () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_GENDERS,
            selected: '',
            setSelected,
            error: null,
            isLoading: false,
        });

        render(<GenderFetchData onChange={onChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox'), '2');

        expect(setSelected).toHaveBeenCalledWith('2');
        expect(onChange).toHaveBeenCalledWith('2');
    });

    it('shows "Error loading data" placeholder and error span when hook returns an error', () => {
        useFetchSortedData.mockReturnValue({
            data: [],
            selected: '',
            setSelected: vi.fn(),
            error: 'Network error',
            isLoading: false,
        });
        render(<GenderFetchData onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Error loading data' })).toBeInTheDocument();
        expect(screen.getByText('Error loading genders.')).toBeInTheDocument();
    });
});
