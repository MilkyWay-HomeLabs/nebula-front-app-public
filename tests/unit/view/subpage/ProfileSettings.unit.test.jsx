import React from 'react';
import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSettings from '../../../../src/view/subpage/ProfileSettings.jsx';
import * as UserSettingsUpdate from '../../../../src/api/user/UserSettingsUpdate.js';

vi.mock('../../../../src/api/user/UserSettingsUpdate.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        loadUserData: vi.fn(() => Promise.resolve({
            id: 1,
            settings: {
                general: {theme: {id: 17, name: 'Default'}},
                sound: {
                    muted: false,
                    battleCry: true,
                    volumeMaster: 100,
                    volumeMusic: 100,
                    volumeEffects: 100,
                    volumeVoices: 100
                }
            }
        })),
        fetchUserData: vi.fn(() => Promise.resolve(true)),
        setTemporaryTheme: vi.fn()
    }
}));

vi.mock('../../../../src/singles/ThemeListenerSingleton.js', () => ({
    default: {notifyObservers: vi.fn(() => Promise.resolve())}
}));

// ThemeUpdaterFetchData makes a network call — replace with a simple select stub
vi.mock('../../../../src/api/components/updaters/ThemeUpdaterFetchData.jsx', () => ({
    default: ({value, onChange}) => (
        <select
            data-testid="theme-select"
            value={value?.id ?? ''}
            onChange={(e) => onChange({id: parseInt(e.target.value), name: 'Test Theme'})}
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

test('renders settings form with all controls', async () => {
    render(<ProfileSettings/>);
    const form = within(document.body);

    await waitFor(() => {
        expect(form.getByTestId('profile-settings-root')).toBeInTheDocument();
        expect(form.getByTestId('profile-settings-form')).toBeInTheDocument();
        expect(form.getByTestId('range-volumeMaster')).toBeInTheDocument();
        expect(form.getByTestId('range-volumeMusic')).toBeInTheDocument();
        expect(form.getByTestId('range-volumeEffects')).toBeInTheDocument();
        expect(form.getByTestId('range-volumeVoices')).toBeInTheDocument();
        expect(form.getByTestId('checkbox-battle-cry')).toBeInTheDocument();
        expect(form.getByTestId('checkbox-muted')).toBeInTheDocument();
        expect(form.getByTestId('save-settings-button')).toBeInTheDocument();
    });
});

test('loads user data and populates volume sliders', async () => {
    render(<ProfileSettings/>);
    const form = within(document.body);

    await waitFor(() => {
        expect(form.getByTestId('range-volumeMaster')).toHaveValue('100');
        expect(form.getByTestId('range-volumeMusic')).toHaveValue('100');
    });
});

test('toggles muted checkbox', async () => {
    render(<ProfileSettings/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('checkbox-muted')).toBeInTheDocument());

    const checkbox = form.getByTestId('checkbox-muted');
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
});

test('toggles battle cry checkbox', async () => {
    render(<ProfileSettings/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('checkbox-battle-cry')).toBeInTheDocument());

    const checkbox = form.getByTestId('checkbox-battle-cry');
    expect(checkbox).toBeChecked(); // default is true

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
});

test('shows success alert and calls API on save', async () => {
    UserSettingsUpdate.default.mockResolvedValue({success: true});
    vi.stubGlobal('alert', vi.fn());

    render(<ProfileSettings/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('save-settings-button')).toBeInTheDocument());

    await userEvent.click(form.getByTestId('save-settings-button'));

    await waitFor(() => {
        expect(UserSettingsUpdate.default).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Profile data updated');
    });
});

test('shows error alert when API returns false', async () => {
    UserSettingsUpdate.default.mockResolvedValue({success: false});
    vi.stubGlobal('alert', vi.fn());

    render(<ProfileSettings/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('save-settings-button')).toBeInTheDocument());

    await userEvent.click(form.getByTestId('save-settings-button'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Something is wrong...');
    });
});
