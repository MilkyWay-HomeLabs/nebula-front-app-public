import React from 'react';
import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, render, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileEditor from '../../../../src/view/subpage/ProfileEditor.jsx';
import * as UserProfileDataUpdate from '../../../../src/api/user/UserProfileDataUpdate.js';

vi.mock('../../../../src/api/user/UserProfileDataUpdate.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../../src/data/UserData.js', () => ({
    default: {
        loadUserData: vi.fn(() => ({
            id: 1,
            login: 'testuser',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            birthDate: '1990-01-15',
            nationality: {id: 180, name: 'Poland', code: 'POL'},
            gender: {id: 1, name: 'Male'}
        })),
        fetchUserData: vi.fn(() => Promise.resolve(true))
    }
}));

// Replace external fetch-based dropdowns with simple stubs
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
            onChange={(e) => onChange({id: parseInt(e.target.value), name: 'Female'})}
        >
            <option value="1">Male</option>
            <option value="2">Female</option>
        </select>
    )
}));

// ImageUploader has side effects (avatar fetch) — stub it out
vi.mock('../../../../src/view/component/ImageUploader.jsx', () => ({
    default: () => <div data-testid="image-uploader-stub"/>
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

test('renders profile editor form with all fields', async () => {
    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => {
        expect(form.getByTestId('profile-editor-root')).toBeInTheDocument();
        expect(form.getByTestId('profile-editor-form')).toBeInTheDocument();
        expect(form.getByTestId('input-username')).toBeInTheDocument();
        expect(form.getByTestId('input-email')).toBeInTheDocument();
        expect(form.getByTestId('input-first-name')).toBeInTheDocument();
        expect(form.getByTestId('input-last-name')).toBeInTheDocument();
        expect(form.getByTestId('input-birthdate')).toBeInTheDocument();
        expect(form.getByTestId('save-changes-button')).toBeInTheDocument();
    });
});

test('loads user data and populates fields', async () => {
    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => {
        expect(form.getByTestId('input-username')).toHaveValue('testuser');
        expect(form.getByTestId('input-email')).toHaveValue('test@example.com');
        expect(form.getByTestId('input-first-name')).toHaveValue('John');
        expect(form.getByTestId('input-last-name')).toHaveValue('Doe');
    });
});

test('username and email fields are disabled', async () => {
    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => {
        expect(form.getByTestId('input-username')).toBeDisabled();
        expect(form.getByTestId('input-email')).toBeDisabled();
    });
});

test('shows validation error for invalid first name', async () => {
    const {default: UserData} = await import('../../../../src/data/UserData.js');

    // Start with empty firstName so typing 'Jo' gives exactly 'Jo'
    UserData.loadUserData.mockReturnValueOnce({
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        firstName: '',
        lastName: 'Doe',
        birthDate: '1990-01-15',
        nationality: {id: 180, name: 'Poland', code: 'POL'},
        gender: {id: 1, name: 'Male'}
    });

    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('input-first-name')).toHaveValue(''));

    // 'Jo' is 2 chars — fails isTextNameValid which requires 3-45 chars
    await userEvent.type(form.getByTestId('input-first-name'), 'Jo');

    await waitFor(() => {
        expect(form.getByTestId('first-name-error')).toBeInTheDocument();
    });
});

test('shows success alert on successful save', async () => {
    UserProfileDataUpdate.default.mockResolvedValue({success: true});
    vi.stubGlobal('alert', vi.fn());

    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('save-changes-button')).toBeInTheDocument());

    await userEvent.click(form.getByTestId('save-changes-button'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Profile data updated');
    });
});

test('shows error alert when API returns unsuccessful result', async () => {
    UserProfileDataUpdate.default.mockResolvedValue({success: false});
    vi.stubGlobal('alert', vi.fn());

    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('save-changes-button')).toBeInTheDocument());

    await userEvent.click(form.getByTestId('save-changes-button'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to update profile. Please try again.');
    });
});

test('shows error alert when API throws', async () => {
    UserProfileDataUpdate.default.mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {
    });

    render(<ProfileEditor/>);
    const form = within(document.body);

    await waitFor(() => expect(form.getByTestId('save-changes-button')).toBeInTheDocument());

    await userEvent.click(form.getByTestId('save-changes-button'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
            expect.stringContaining('Incorrect form data')
        );
    });
});
