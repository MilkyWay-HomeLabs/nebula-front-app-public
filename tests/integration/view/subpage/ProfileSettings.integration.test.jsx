import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSettings from '../../../../src/view/subpage/ProfileSettings.jsx';
import * as UserSettingsUpdate from '../../../../src/api/user/UserSettingsUpdate.js';

const MOCK_USER_DATA = {
    id: 42,
    settings: {
        general: {theme: {id: 17, name: 'Default'}},
        sound: {
            muted: false,
            battleCry: true,
            volumeMaster: 80,
            volumeMusic: 60,
            volumeEffects: 70,
            volumeVoices: 50
        }
    }
};

vi.mock('../../../../src/api/user/UserSettingsUpdate.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        loadUserData: vi.fn(() => Promise.resolve(MOCK_USER_DATA)),
        fetchUserData: vi.fn(() => Promise.resolve(true)),
        setTemporaryTheme: vi.fn()
    }
}));

vi.mock('../../../../src/singles/ThemeListenerSingleton.js', () => ({
    default: {notifyObservers: vi.fn(() => Promise.resolve())}
}));

vi.mock('../../../../src/api/components/updaters/ThemeUpdaterFetchData.jsx', () => ({
    default: ({value, onChange}) => (
        <select
            data-testid="theme-select"
            value={value?.id ?? ''}
            onChange={(e) => onChange({id: parseInt(e.target.value), name: 'Dark'})}
        >
            <option value="17">Default</option>
            <option value="18">Dark</option>
        </select>
    )
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe('ProfileSettings - Integration Tests', () => {
    test('loads user data and passes correct payload to API on save', async () => {
        UserSettingsUpdate.default.mockResolvedValue({success: true});
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileSettings/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('range-volumeMaster')).toHaveValue('80'));

        await userEvent.click(form.getByTestId('save-settings-button'));

        await waitFor(() => {
            expect(UserSettingsUpdate.default).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 42,
                    theme: {id: 17, name: 'Default'}
                }),
                expect.objectContaining({
                    userId: 42,
                    volumeMaster: 80,
                    volumeMusic: 60,
                    volumeEffects: 70,
                    volumeVoices: 50,
                    muted: false,
                    battleCry: true
                })
            );
            expect(window.alert).toHaveBeenCalledWith('Profile data updated');
        });
    });

    test('toggling muted checkbox changes payload sent to API', async () => {
        UserSettingsUpdate.default.mockResolvedValue(true);
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileSettings/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('checkbox-muted')).toBeInTheDocument());

        await userEvent.click(form.getByTestId('checkbox-muted'));
        await userEvent.click(form.getByTestId('save-settings-button'));

        await waitFor(() => {
            expect(UserSettingsUpdate.default).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({muted: true})
            );
        });
    });

    test('shows partial success alert when data fetch fails after save', async () => {
        const {default: UserData} = await import('../../../../src/data/UserData.js');
        UserSettingsUpdate.default.mockResolvedValue({success: true});
        UserData.fetchUserData.mockResolvedValue(false);
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileSettings/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('save-settings-button')).toBeInTheDocument());

        await userEvent.click(form.getByTestId('save-settings-button'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Profile data updated but not downloaded');
        });
    });

    test('shows error alert when API returns false', async () => {
        UserSettingsUpdate.default.mockResolvedValue({success: false});
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileSettings/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('save-settings-button')).toBeInTheDocument());

        await userEvent.click(form.getByTestId('save-settings-button'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Something is wrong...');
        });
    });
});
