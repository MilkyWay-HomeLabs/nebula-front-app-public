import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenderUpdaterFetchData from '../../../../../src/api/components/updaters/GenderUpdaterFetchData';

vi.mock('../../../../../src/api/components/UseFetchSortedData', () => ({
    default: vi.fn(),
}));

import useFetchSortedData from '../../../../../src/api/components/UseFetchSortedData';

const MOCK_GENDERS = [
    { id: 1, name: 'Female' },
    { id: 2, name: 'Male' },
    { id: 3, name: 'Other' },
];

afterEach(() => cleanup());

describe('GenderUpdaterFetchData – unit', () => {
    beforeEach(() => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_GENDERS,
            selected: 1,
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
    });

    it('renders a label with text "Gender:"', () => {
        render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(screen.getByText(/gender:/i)).toBeInTheDocument();
    });

    it('renders all options from hook data', () => {
        render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
    });

    it('passes value prop as initialValue to useFetchSortedData', () => {
        const value = { id: 2 };
        render(<GenderUpdaterFetchData value={value} onChange={vi.fn()} />);
        // hook should have been called with value as third arg
        expect(useFetchSortedData).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Function),
            value
        );
    });

    it('calls onChange with the full gender object when a valid option is selected', async () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_GENDERS,
            selected: 1,
            setSelected,
            error: null,
            isLoading: false,
        });

        render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox'), '2');

        expect(setSelected).toHaveBeenCalledWith(2);
        expect(onChange).toHaveBeenCalledWith({ id: 2, name: 'Male' });
    });

    it('calls onChange with empty string and resets selected when placeholder is chosen', async () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        // Add a placeholder option manually so jsdom can select empty value
        useFetchSortedData.mockReturnValue({
            data: MOCK_GENDERS,
            selected: '',
            setSelected,
            error: null,
            isLoading: false,
        });

        const { container } = render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);
        // Simulate selecting non-numeric value by dispatching change event directly
        const select = container.querySelector('#gender-select');
        Object.defineProperty(select, 'value', { value: 'abc', writable: true });
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(setSelected).toHaveBeenCalledWith('');
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('renders inside a div with class combo-box-default', () => {
        const { container } = render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(container.querySelector('.combo-box-default')).not.toBeNull();
    });
});

