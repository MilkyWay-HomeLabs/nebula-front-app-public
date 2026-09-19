import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NationalityUpdaterFetchData from '../../../../../src/api/components/updaters/NationalityUpdaterFetchData';

vi.mock('../../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn(),
}));

import GETRequestPublic from '../../../../../src/api/method/GETRequestPublic';

const MOCK_NATIONALITIES = [
    { id: 3, name: 'Polish' },
    { id: 1, name: 'British' },
    { id: 2, name: 'French' },
];

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('NationalityUpdaterFetchData – integration', () => {
    it('renders nationality options sorted alphabetically after fetch', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_NATIONALITIES });

        render(<NationalityUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'British' })).toBeInTheDocument()
        );

        const options = screen.getAllByRole('option').map((o) => o.textContent);
        expect(options).toEqual(['British', 'French', 'Polish']);
    });

    it('pre-selects the option matching the value prop', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_NATIONALITIES });

        render(<NationalityUpdaterFetchData value={{ id: 3 }} onChange={vi.fn()} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'Polish' })).toBeInTheDocument()
        );

        expect(screen.getByRole('combobox')).toHaveValue('3');
    });

    it('calls onChange with full object after user selects an option', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: MOCK_NATIONALITIES });
        const onChange = vi.fn();

        render(<NationalityUpdaterFetchData value={{ id: 1 }} onChange={onChange} />);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'French' })).toBeInTheDocument()
        );

        await userEvent.selectOptions(screen.getByRole('combobox'), '2');

        expect(onChange).toHaveBeenCalledWith({ id: 2, name: 'French' });
    });

    it('renders no options when the API call fails', async () => {
        GETRequestPublic.mockResolvedValue({ success: false, message: 'Unavailable' });

        render(<NationalityUpdaterFetchData value={{ id: 1 }} onChange={vi.fn()} />);

        await new Promise((r) => setTimeout(r, 100));
        expect(screen.queryByRole('option')).toBeNull();
    });
});

