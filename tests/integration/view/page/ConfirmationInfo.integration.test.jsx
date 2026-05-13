import React from 'react';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ConfirmationInfo from '../../../../src/view/page/ConfirmationInfo';
import {NAVIGATE_LOGIN} from '../../../../src/util/NavigationUtils';

describe('ConfirmationInfo Component - Integration Tests', () => {
    afterEach(() => {
        cleanup();
    });
    it('calls onNavigate with NAVIGATE_LOGIN when "Go to login page" is clicked', () => {
        const onNavigate = vi.fn();
        render(<ConfirmationInfo onNavigate={onNavigate}/>);

        const loginLink = screen.getByText('Go to login page');
        fireEvent.click(loginLink);

        expect(onNavigate).toHaveBeenCalledTimes(1);
        expect(onNavigate).toHaveBeenCalledWith(NAVIGATE_LOGIN);
    });
});
