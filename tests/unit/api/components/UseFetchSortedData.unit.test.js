import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useFetchSortedData from '../../../../src/api/components/UseFetchSortedData';

// Mock GETRequestPublic to avoid real network calls
vi.mock('../../../../src/api/method/GETRequestPublic', () => ({
    default: vi.fn(),
}));

import GETRequestPublic from '../../../../src/api/method/GETRequestPublic';

const ITEMS = [
    { id: 3, name: 'Zebra' },
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Mango' },
];

const sortByName = (a, b) => a.name.localeCompare(b.name);

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useFetchSortedData – unit', () => {
    it('returns empty data and no error on initial render before fetch resolves', () => {
        // Never resolves during this test
        GETRequestPublic.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        expect(result.current.data).toEqual([]);
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(true);
        expect(result.current.selected).toBe('');
    });

    it('returns sorted data after successful fetch', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: ITEMS });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual([
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Mango' },
            { id: 3, name: 'Zebra' },
        ]);
        expect(result.current.error).toBeNull();
    });

    it('pre-selects the id from initialValue', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: ITEMS });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName, { id: 2 })
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selected).toBe(2);
    });

    it('uses empty string as selected when no initialValue provided', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: ITEMS });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selected).toBe('');
    });

    it('sets error when API returns success: false', async () => {
        GETRequestPublic.mockResolvedValue({
            success: false,
            message: 'Not found',
        });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual([]);
        expect(result.current.error).toBe('Not found');
    });

    it('falls back to generic message when error response has no message', async () => {
        GETRequestPublic.mockResolvedValue({ success: false });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBe('Failed to fetch data');
    });

    it('sets error when GETRequestPublic throws', async () => {
        GETRequestPublic.mockRejectedValue(new Error('Network failure'));

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBe('Network failure');
        expect(result.current.data).toEqual([]);
    });

    it('setSelected updates the selected value', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: ITEMS });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => result.current.setSelected(3));

        expect(result.current.selected).toBe(3);
    });

    it('does not retry after an error (stops further fetches)', async () => {
        GETRequestPublic.mockResolvedValue({ success: false, message: 'Fail' });

        const { result } = renderHook(() =>
            useFetchSortedData('https://api.test/items', sortByName)
        );

        await waitFor(() => expect(result.current.error).toBe('Fail'));

        // GETRequestPublic should have been called exactly once
        expect(GETRequestPublic).toHaveBeenCalledTimes(1);
    });

    it('passes the correct URL to GETRequestPublic', async () => {
        GETRequestPublic.mockResolvedValue({ success: true, data: [] });

        renderHook(() =>
            useFetchSortedData('https://api.test/custom-endpoint', sortByName)
        );

        await waitFor(() => expect(GETRequestPublic).toHaveBeenCalled());

        expect(GETRequestPublic).toHaveBeenCalledWith('https://api.test/custom-endpoint');
    });
});

