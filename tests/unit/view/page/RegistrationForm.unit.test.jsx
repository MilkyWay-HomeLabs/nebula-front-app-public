import React from 'react';
import {cleanup, render, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '../../../../src/view/page/RegistrationForm';
import {afterEach, expect, test, vi} from 'vitest';

// Mock child components to isolate RegistrationForm
vi.mock('../../../../src/api/components/geters/NationalityFetchData', () => ({
    default: ({onChange}) => {
        React.useEffect(() => onChange(1), [onChange]);
        return null;
    }
}));
vi.mock('../../../../src/api/components/geters/GenderFetchData', () => ({
    default: ({onChange}) => {
        React.useEffect(() => onChange(1), [onChange]);
        return null;
    }
}));

afterEach(() => cleanup());

test('calls onRegister when form is valid', async () => {
    const onRegister = vi.fn();
    render(<RegistrationForm onRegister={onRegister} onNavigate={vi.fn()}/>);

    const form = within(document.body); // or use container from render

    await userEvent.type(form.getByLabelText(/Your login:/i), 'user123');
    await userEvent.type(form.getByLabelText(/^Email:/i), 'user@example.com');
    await userEvent.type(form.getByLabelText(/Your Password:/i), 'StrongPass1');
    await userEvent.type(form.getByLabelText(/Repeat password:/i), 'StrongPass1');

    // stub global alert to avoid issues
    vi.stubGlobal('alert', vi.fn());

    await userEvent.click(form.getByRole('button', {name: /Register Account/i}));

    expect(onRegister).toHaveBeenCalled();
});
