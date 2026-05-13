import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeUpdaterFetchData from '../../../../../src/api/components/updaters/ThemeUpdaterFetchData';

vi.mock('../../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn(),
}));

import GETRequestPublic from '../../../../../src/api/method/GETRequestPublic';

const MOCK_THEMES = [
    { id: 2, name: 'Light' },
    { id: 1, name: 'Dark' },
    { id: 3, name: 'System' },
];

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('ThemeUpdaterFetchData – integration', () => {
    it('renders theme options sorted alphabetically after fetch', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_THEMES });

        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument()
        );

        const options = screen.getAllByRole('option').map((o) => o.textContent);
        expect(options).toEqual(['Dark', 'Light', 'System']);
    });

    it('pre-selects the option matching the value prop', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_THEMES });

        render(<ThemeUpdaterFetchData value={{ id: 2 }} onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument()
        );

        expect(screen.getByRole('combobox')).toHaveValue('2');
    });

    it('calls onChange with full theme object after user selects an option', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_THEMES });
        const onChange = vi.fn();

        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument()
        );

        await userEvent.selectOptions(screen.getByRole('combobox'), '3');

        expect(onChange).toHaveBeenCalledWith({ id: 3, name: 'System' });
    });

    it('renders no options when the API call fails', async () => {
        GETRequestPublic.mockResolvedValue({ success: false, message: 'Error' });

        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        await new Promise((r) => setTimeout(r, 100));
        expect(screen.queryByRole('option')).toBeNull();
    });

    it('renders no options when GETRequestPublic throws', async () => {
        GETRequestPublic.mockRejectedValue(new Error('Network failure'));

        render(<ThemeUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        await new Promise((r) => setTimeout(r, 100));
        expect(screen.queryByRole('option')).toBeNull();
    });
});

