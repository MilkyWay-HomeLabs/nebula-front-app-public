import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Menu from '../../../../src/view/component/Menu.jsx';
import UserData from '../../../../src/data/UserData';
import themeListenerSingletonInstance from '../../../../src/singles/ThemeListenerSingleton';

vi.mock('../../../../src/data/UserData', () => ({
    default: {
        getThemeName: vi.fn().mockResolvedValue('Default')
    }
}));

vi.mock('../../../../src/singles/ThemeListenerSingleton', () => {
    const observers = [];
    const addObserver = vi.fn((fn) => observers.push(fn));
    const removeObserver = vi.fn((fn) => {
        const idx = observers.indexOf(fn);
        if (idx !== -1) observers.splice(idx, 1);
    });

    return {
        default: {
            addObserver,
            removeObserver,
            __observers: observers
        }
    };
});

vi.mock('../../../../src/view/component/AvatarComponent.jsx', () => ({
    __esModule: true,
    default: (props) => (
        <div data-testid="mock-avatar" style={{width: props.width, height: props.height}}>
            AV
        </div>
    )
}));

vi.mock('../../../../src/util/ImageUploaderUtils', () => ({
    processAndUploadImage: vi.fn().mockResolvedValue(true)
}));

vi.mock('../../../../src/util/AssetUrl.js', () => ({
    assetUrl: (p) => `/assets/${p}`
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (themeListenerSingletonInstance.__observers) {
        themeListenerSingletonInstance.__observers.length = 0;
    }
});

describe('Menu - integration', () => {
    test('opens popup and reacts to theme listener update', async () => {
        render(<Menu onNavigate={vi.fn()} onSubNavigate={vi.fn()}/>);

        const menu = screen.getByTestId('menu-container');
        expect(menu).toBeInTheDocument();

        await waitFor(() => {
            expect(menu.getAttribute('data-theme')).toBe('Default');
        });

        await userEvent.click(screen.getByTestId('avatar-container'));
        expect(screen.getByText('Change Avatar')).toBeInTheDocument();

        const observer = themeListenerSingletonInstance.__observers?.[0];

        if (observer) {
            UserData.getThemeName.mockResolvedValue('Dark');

            await observer();

            await waitFor(() => {
                expect(menu.getAttribute('data-theme')).toBe('Dark');
            });
        } else {
            expect(themeListenerSingletonInstance.addObserver).toHaveBeenCalled();
        }
    });
});
