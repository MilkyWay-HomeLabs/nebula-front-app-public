import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeUpdaterFetchData from '../../../../../src/api/components/updaters/ThemeUpdaterFetchData';

vi.mock('../../../../../src/api/components/UseFetchSortedData', () => ({
    default: vi.fn(),
}));

import useFetchSortedData from '../../../../../src/api/components/UseFetchSortedData';

const MOCK_THEMES = [
    { id: 1, name: 'Dark' },
    { id: 2, name: 'Light' },
    { id: 3, name: 'System' },
];

afterEach(() => cleanup());

describe('ThemeUpdaterFetchData – unit', () => {
    beforeEach(() => {
        useFetchSortedData.mockReturnValue({
            data: MOCK_THEMES,
            selected: 1,
            setSelected: vi.fn(),
            error: null,
            isLoading: false,
        });
    });

    it('renders a select element', () => {
        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders all options from hook data', () => {
        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
    });

    it('passes value prop as initialValue to useFetchSortedData', () => {
        const value = { id: 2 };
        render(<ThemeUpdaterFetchData value={value} onChange={vi.fn()} />);
        expect(useFetchSortedData).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Function),
            value
        );
    });

    it('calls onChange with full theme object when valid option selected', async () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_THEMES,
            selected: 1,
            setSelected,
            error: null,
            isLoading: false,
        });
        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox'), '2');
        expect(setSelected).toHaveBeenCalledWith(2);
        expect(onChange).toHaveBeenCalledWith({ id: 2, name: 'Light' });
    });

    it('resets selection and calls onChange with empty string on NaN input', () => {
        const setSelected = vi.fn();
        const onChange = vi.fn();
        useFetchSortedData.mockReturnValue({
            data: MOCK_THEMES,
            selected: '',
            setSelected,
            error: null,
            isLoading: false,
        });
        const { container } = render(
            <ThemeUpdaterFetchData value={{ id: 1 }} onChange={onChange} />
        );
        const select = container.querySelector('select');
        Object.defineProperty(select, 'value', { value: 'not-a-number', writable: true });
        select.dispatchEvent(new Event('change', { bubbles: true }));
        expect(setSelected).toHaveBeenCalledWith('');
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('renders inside a div with class item-container', () => {
        const { container } = render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);
        expect(container.querySelector('.item-container')).not.toBeNull();
    });
});

