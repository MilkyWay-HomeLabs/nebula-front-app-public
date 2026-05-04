import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import Achievements from '../../../../src/view/subpage/Achievements.jsx';
import UserData from '../../../../src/data/UserData';

// mock UserData only
vi.mock('../../../../src/data/UserData', () => ({
    default: {
        loadUserData: vi.fn(),
    },
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('Achievements - integration', () => {
    test('renders rows from userData and stars reflect level', async () => {
        const achievements = [
            {id: 1, iconUrl: '/icons/1.svg', name: 'Total Progress', progress: '0,00%', level: 2},
            {id: 2, iconUrl: '/icons/2.svg', name: 'Chess Progress', progress: '0,00%', level: 4}
        ];
        UserData.loadUserData.mockResolvedValue({achievements});

        render(<Achievements/>);

        // wait for rows to appear
        await waitFor(() => {
            expect(screen.getByTestId('achievement-row-1')).toBeDefined();
            expect(screen.getByTestId('achievement-row-2')).toBeDefined();
        });

        // check that images are rendered with proper alt and dimension attrs
        const img1 = screen.getByAltText('Total Progress');
        expect(img1).toBeDefined();
        expect(img1.getAttribute('width')).toBe('40');
        expect(img1.getAttribute('height')).toBe('40');

        // check star counts (level number of .gold-star)
        const row1 = screen.getByTestId('achievement-row-1');
        const goldStarsRow1 = row1.querySelectorAll('.gold-star');
        expect(goldStarsRow1.length).toBe(2);

        const row2 = screen.getByTestId('achievement-row-2');
        const goldStarsRow2 = row2.querySelectorAll('.gold-star');
        expect(goldStarsRow2.length).toBe(4);
    });
});