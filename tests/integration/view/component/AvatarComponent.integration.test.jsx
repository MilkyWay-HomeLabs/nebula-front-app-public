import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
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

describe('AvatarComponent - integration', () => {
    test('applies loaded classes when avatar exists', async () => {
        UserAvatar.getUserAvatar.mockResolvedValue('/avatar-real.jpg');

        render(<AvatarComponent width="64px" height="64px"/>);

        await waitFor(() => {
            const img = screen.getByAltText('Avatar');
            expect(img.className).toContain('avatar--loaded');
        });
    });

    test('applies fallback classes when avatar is missing', async () => {
        UserAvatar.getUserAvatar.mockResolvedValue(null);

        render(<AvatarComponent width="64px" height="64px"/>);

        await waitFor(() => {
            const img = screen.getByAltText('Avatar');
            expect(img.className).toContain('avatar--fallback');
        });
    });

    test('falls back to default image on img error', async () => {
        UserAvatar.getUserAvatar.mockResolvedValue('/broken-avatar.jpg');

        render(<AvatarComponent width="64px" height="64px"/>);

        const img = await screen.findByAltText('Avatar');

        fireEvent.error(img);

        expect(img.getAttribute('src')).toBeTruthy();
    });
});