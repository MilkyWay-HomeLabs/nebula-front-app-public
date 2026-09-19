import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NationalityUpdaterFetchData from '../../../../../src/api/components/updaters/NationalityUpdaterFetchData';

vi.mock('../../../../../src/api/components/UseFetchSortedData', () => ({
    default: vi.fn(),
}));

import useFetchSortedData from '../../../../../src/api/components/UseFetchSortedData';

const MOCK_NATIONALITIES = [
    { id: 1, name: 'British' },
    { id: 2, name: 'French' },
    { id: 3, name: 'Polish' },
];

afterEach(() => cleanup());

describe('NationalityUpdaterFetchData – unit', () => {
    beforeEach(() => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_NATIONALITIES,
            selected: 1,
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
    });

    it('renders a label with text "Nationality:"', () => {
        render(<NationalityUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(screen.getByText(/nationality:/i)).toBeInTheDocument();
    });

    it('renders all options from hook data', () => {
        render(<NationalityUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'British' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'French' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Polish' })).toBeInTheDocument();
    });

    it('passes value prop as initialValue to useFetchSortedData', () => {
        const value = { id: 3 };
        render(<NationalityUpdaterFetchData value={value} onChange={vi.fn()} />);
        expect(useFetchSortedData).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Function),
            value
        );
    });

    it('calls onChange with full nationality object when valid option selected', async () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_NATIONALITIES,
            selected: 1,
            setSelected,
            error: null,
            isLoading: false,
        });
        render(<NationalityUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox'), '3');
        expect(setSelected).toHaveBeenCalledWith(3);
        expect(onChange).toHaveBeenCalledWith({ id: 3, name: 'Polish' });
    });

    it('resets selection and calls onChange with empty string on NaN input', () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_NATIONALITIES,
            selected: '',
            setSelected,
            error: null,
            isLoading: false,
        });
        const { container } = render(
            <NationalityUpdaterFetchData value={{ id: 1 }} onChange={onChange} />
        );
        const select = container.querySelector('#nationality-select');
        Object.defineProperty(select, 'value', { value: 'xyz', writable: true });
        select.dispatchEvent(new Event('change', { bubbles: true }));
        expect(setSelected).toHaveBeenCalledWith('');
        expect(onChange).toHaveBeenCalledWith('');
    });
});

