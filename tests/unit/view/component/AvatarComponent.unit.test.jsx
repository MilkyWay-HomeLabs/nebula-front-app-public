import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import AvatarComponent from '../../../../src/view/component/AvatarComponent.jsx';
import UserAvatar from '../../../../src/data/UserAvatar';
import avatarListenerSingletonInstance from '../../../../src/singles/AvatarListenerSingleton';

vi.mock('../../../../src/data/UserAvatar', () => ({
    default: {
        getUserAvatar: vi.fn()
    }
}));

vi.mock('../../../../src/singles/AvatarListenerSingleton', () => {
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

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (avatarListenerSingletonInstance.__observers) {
        avatarListenerSingletonInstance.__observers.length = 0;
    }
});

describe('AvatarComponent - unit', () => {
    test('renders avatar image element', async () => {
        UserAvatar.getUserAvatar.mockResolvedValue('/mock-avatar.jpg');

        render(<AvatarComponent width="64px" height="64px"/>);

        await waitFor(() => {
            const img = screen.getByAltText('Avatar');
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toContain('/mock-avatar.jpg');
        });
    });

    test('falls back when avatar is missing', async () => {
        UserAvatar.getUserAvatar.mockResolvedValue(null);

        render(<AvatarComponent width="64px" height="64px"/>);

        await waitFor(() => {
            const img = screen.getByAltText('Avatar');
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toBeTruthy();
        });
    });

    test('registers and removes avatar listener', async () => {
        UserAvatar.getUserAvatar.mockResolvedValue('/mock-avatar.jpg');

        const {unmount} = render(<AvatarComponent width="64px" height="64px"/>);

        expect(avatarListenerSingletonInstance.addObserver).toHaveBeenCalled();

        unmount();

        expect(avatarListenerSingletonInstance.removeObserver).toHaveBeenCalled();
    });

    test('updates avatar when observer is triggered', async () => {
        UserAvatar.getUserAvatar
            .mockResolvedValueOnce('/avatar-old.jpg')
            .mockResolvedValueOnce('/avatar-new.jpg');

        render(<AvatarComponent width="64px" height="64px"/>);

        await waitFor(() => {
            expect(screen.getByAltText('Avatar').getAttribute('src')).toContain('/avatar-old.jpg');
        });

        const observer = avatarListenerSingletonInstance.__observers?.[0];
        expect(observer).toBeTruthy();

        await observer();

        await waitFor(() => {
            expect(screen.getByAltText('Avatar').getAttribute('src')).toContain('/avatar-new.jpg');
        });
    });
});
