import React from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileEditor from '../../../../src/view/subpage/ProfileEditor.jsx';
import * as UserProfileDataUpdate from '../../../../src/api/user/UserProfileDataUpdate.js';

const MOCK_USER = {
    id: 42,
    login: 'integuser',
    email: 'integ@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    birthDate: '1995-06-20',
    nationality: {id: 180, name: 'Poland', code: 'POL'},
    gender: {id: 2, name: 'Female'}
};

vi.mock('../../../../src/api/user/UserProfileDataUpdate.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        loadUserData: vi.fn(() => MOCK_USER),
        fetchUserData: vi.fn(() => Promise.resolve(true))
    }
}));

vi.mock('../../../../src/api/components/updaters/NationalityUpdaterFetchData.jsx', () => ({
    default: ({value, onChange}) => (
        <select
            data-testid="nationality-select"
            value={value?.id ?? ''}
            onChange={(e) => onChange({id: parseInt(e.target.value), name: 'Germany', code: 'DEU'})}
        >
            <option value="180">Poland</option>
            <option value="82">Germany</option>
        </select>
    )
}));

vi.mock('../../../../src/api/components/updaters/GenderUpdaterFetchData.jsx', () => ({
    default: ({value, onChange}) => (
        <select
            data-testid="gender-select"
            value={value?.id ?? ''}
            onChange={(e) => onChange({id: parseInt(e.target.value), name: 'Male'})}
        >
            <option value="1">Male</option>
            <option value="2">Female</option>
        </select>
    )
}));

vi.mock('../../../../src/view/component/ImageUploader.jsx', () => ({
    default: () => <div data-testid="image-uploader-stub"/>
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe('ProfileEditor - Integration Tests', () => {
    test('sends correct payload to API on save', async () => {
        UserProfileDataUpdate.default.mockResolvedValue({success: true});
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileEditor/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('input-first-name')).toHaveValue('Jane'));

        await userEvent.click(form.getByTestId('save-changes-button'));

        await waitFor(() => {
            expect(UserProfileDataUpdate.default).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 42,
                    firstName: 'Jane',
                    lastName: 'Smith',
                    nationality: {id: 180, name: 'Poland', code: 'POL'},
                    gender: {id: 2, name: 'Female'}
                })
            );
            expect(window.alert).toHaveBeenCalledWith('Profile data updated');
        });
    });

    test('shows partial success when data fetch fails after save', async () => {
        const {default: UserData} = await import('../../../../src/data/UserData.js');
        UserProfileDataUpdate.default.mockResolvedValue({success: true});
        UserData.fetchUserData.mockResolvedValue(false);
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileEditor/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('save-changes-button')).toBeInTheDocument());

        await userEvent.click(form.getByTestId('save-changes-button'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Profile data updated but not downloaded');
        });
    });

    test('shows error alert when API returns unsuccessful result', async () => {
        UserProfileDataUpdate.default.mockResolvedValue({success: false});
        vi.stubGlobal('alert', vi.fn());

        const {container} = render(<ProfileEditor/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('save-changes-button')).toBeInTheDocument());

        await userEvent.click(form.getByTestId('save-changes-button'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to update profile. Please try again.');
        });
    });

    test('shows validation error alert when form data is invalid', async () => {
        vi.stubGlobal('alert', vi.fn());

        const {default: UserData} = await import('../../../../src/data/UserData.js');
        UserData.loadUserData.mockReturnValueOnce({
            ...MOCK_USER,
            firstName: ''
        });

        const {container} = render(<ProfileEditor/>);
        const form = within(container);

        await waitFor(() => expect(form.getByTestId('input-first-name')).toHaveValue(''));

        // Trigger saveChanges directly by dispatching submit event — bypasses HTML5 required validation
        const formElement = container.querySelector('form');
        formElement.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));

        await waitFor(() => {
            expect(UserProfileDataUpdate.default).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                'Incorrect form data, this usually happens if the name fields contain illegal characters or are empty.'
            );
        });
    });
});
