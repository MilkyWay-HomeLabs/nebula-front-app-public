import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// ---- Now import the tested module and mocked singletons/modules ----
import Menu from '../../../../src/view/component/Menu.jsx';
import themeListenerSingletonInstance from '../../../../src/singles/ThemeListenerSingleton';
import * as ImageUploaderUtils from '../../../../src/util/ImageUploaderUtils';

// ---- MOCKS (must be declared before importing tested module) ----
vi.mock('../../../../src/data/UserData', () => ({
    default: {
        getThemeName: vi.fn().mockResolvedValue('Default'),
    },
}));

vi.mock('../../../../src/singles/ThemeListenerSingleton', () => {
    // create spies inside the factory so they exist at mock hoist time
    const addObserver = vi.fn();
    const removeObserver = vi.fn();
    return {
        default: {addObserver, removeObserver},
    };
});

vi.mock('../../../../src/view/component/AvatarComponent.jsx', () => ({
    __esModule: true,
    default: (props) => (
        <div data-testid="mock-avatar" style={{width: props.width, height: props.height}}>
            AV
        </div>
    ),
}));

vi.mock('../../../../src/util/ImageUploaderUtils', () => {
    const processAndUploadImage = vi.fn().mockResolvedValue(true);
    return {processAndUploadImage};
});

vi.mock('../../../../src/util/AssetUrl.js', () => ({
    assetUrl: (p) => `/assets/${p}`,
}));

// ---- Tests ----
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('Menu - unit', () => {
    test('registers and removes theme listener', async () => {
        const {unmount} = render(<Menu onNavigate={vi.fn()} onSubNavigate={vi.fn()}/>);

        expect(themeListenerSingletonInstance.addObserver).toHaveBeenCalled();
        unmount();
        expect(themeListenerSingletonInstance.removeObserver).toHaveBeenCalled();
    });

    test('clicking menu items calls callbacks', async () => {
        const onNavigate = vi.fn();
        const onSubNavigate = vi.fn();
        render(<Menu onNavigate={onNavigate} onSubNavigate={onSubNavigate}/>);

        // click games
        await userEvent.click(screen.getByText('Games'));
        expect(onSubNavigate).toHaveBeenCalledWith('games');

        // profile editor
        await userEvent.click(screen.getByText('Profile Editor'));
        expect(onSubNavigate).toHaveBeenCalledWith('profileEditor');

        // settings
        await userEvent.click(screen.getByText('User Settings'));
        expect(onSubNavigate).toHaveBeenCalledWith('profileSettings');

        // achievements
        await userEvent.click(screen.getByText('Achievements'));
        expect(onSubNavigate).toHaveBeenCalledWith('achievements');

        // test logout via popup: open avatar menu then click logout
        await userEvent.click(screen.getByTestId('avatar-container'));
        expect(screen.getByText('Log out')).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('logout'));
        expect(onNavigate).toHaveBeenCalledWith('logout');
    });

    test('change avatar triggers file input and upload call', async () => {
        render(<Menu onNavigate={vi.fn()} onSubNavigate={vi.fn()}/>);

        // open avatar popup
        await userEvent.click(screen.getByTestId('avatar-container'));
        const changeAvatar = screen.getByTestId('change-avatar');
        expect(changeAvatar).toBeInTheDocument();

        // simulate clicking "Change Avatar" which triggers file input click.
        await userEvent.click(changeAvatar);

        const fileInput = screen.getByTestId('avatar-file-input');
        // create a fake file and fire change
        const file = new File(['dummy'], 'avatar.png', {type: 'image/png'});
        fireEvent.change(fileInput, {target: {files: [file]}});

        // processAndUploadImage should have been called (mock)
        expect(ImageUploaderUtils.processAndUploadImage).toHaveBeenCalled();
    });
});
