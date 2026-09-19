import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenderUpdaterFetchData from '../../../../../src/api/components/updaters/GenderUpdaterFetchData';

vi.mock('../../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn(),
}));

import GETRequestPublic from '../../../../../src/api/method/GETRequestPublic';

// Backend returns numeric ids
const MOCK_GENDERS = [
    { id: 2, name: 'Male' },
    { id: 1, name: 'Female' },
    { id: 3, name: 'Other' },
];

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('GenderUpdaterFetchData – integration', () => {
    it('renders gender options sorted alphabetically after fetch', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_GENDERS });

        render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument()
        );

        const options = screen.getAllByRole('option').map((o) => o.textContent);
        expect(options).toEqual(['Female', 'Male', 'Other']);
    });

    it('pre-selects the option matching the value prop', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_GENDERS });

        render(<GenderUpdaterFetchData value={{ id: 2 }} onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument()
        );

        expect(screen.getByRole('combobox')).toHaveValue('2');
    });

    it('calls onChange with full object after user selects an option', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_GENDERS });
        const onChange = vi.fn();

        render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
        );

        await userEvent.selectOptions(screen.getByRole('combobox'), '3');

        expect(onChange).toHaveBeenCalledWith({ id: 3, name: 'Other' });
    });

    it('renders no options when the API call fails', async () => {
        GETRequestPublic.mockResolvedValue({ success: false, message: 'Server error' });

        render(<GenderUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        // Give the hook time to settle, then verify no data options appear
        await new Promise((r) => setTimeout(r, 100));
        expect(screen.queryByRole('option')).toBeNull();
    });
});

