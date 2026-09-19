import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import Achievements from '../../../../src/view/subpage/Achievements.jsx';
import UserData from '../../../../src/data/UserData';

// mock UserData module
vi.mock('../../../../src/data/UserData', () => ({
    default: {
        loadUserData: vi.fn(),
    },
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

describe('Achievements - unit', () => {
    test('shows skeleton while loading and renders rows after data resolves', async () => {
        const d = deferred();
        // first render: loadUserData returns unresolved promise -> component shows skeleton
        UserData.loadUserData.mockReturnValueOnce(d.promise);

        render(<Achievements/>);

        // skeleton row should be present while promise unresolved
        expect(document.querySelectorAll('.skeleton-row').length).toBeGreaterThan(0);

        // now resolve with data
        const achievements = [
            {id: 1, iconUrl: '/i1.png', name: 'A1', source: 'chess', progress: '10%', level: 3},
            {id: 2, iconUrl: '/i2.png', name: 'A2', progress: '50%', level: 5},
        ];
        d.resolve({achievements});

        // wait for rows to appear
        await waitFor(() => {
            expect(screen.getByTestId('achievement-row-1')).toBeDefined();
            expect(screen.getByTestId('achievement-row-2')).toBeDefined();
        });
    });

    test('renders a source badge when present and a neutral placeholder when absent', async () => {
        UserData.loadUserData.mockResolvedValueOnce({
            achievements: [
                {id: 1, iconUrl: '/i1.png', name: 'A1', source: 'chess', progress: '10%', level: 3},
                {id: 2, iconUrl: '/i2.png', name: 'A2', progress: '50%', level: 5},
            ],
        });

        render(<Achievements/>);

        await waitFor(() => {
            expect(screen.getByTestId('achievement-row-1')).toBeDefined();
        });

        const row1 = screen.getByTestId('achievement-row-1');
        expect(row1.querySelector('.source-badge-chess')?.textContent).toBe('Chess');

        const row2 = screen.getByTestId('achievement-row-2');
        expect(row2.querySelector('.source-badge-unknown')?.textContent).toBe('—');
    });

    test('handles loadUserData error gracefully and shows empty state', async () => {
        UserData.loadUserData.mockRejectedValueOnce(new Error('fail'));

        render(<Achievements/>);

        await waitFor(() => {
            expect(screen.getByText(/No achievements yet/i)).toBeDefined();
        });
    });
});