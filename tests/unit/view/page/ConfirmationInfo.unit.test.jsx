import React from 'react';
import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import ConfirmationInfo from '../../../../src/view/page/ConfirmationInfo';
import {MESSAGE_HEADER_CONFIRMATION, MESSAGE_LOGIN_PROMPT} from '../../../../src/util/NavigationUtils';

describe('ConfirmationInfo Component - Unit Tests', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders the application logo', () => {
        render(<ConfirmationInfo onNavigate={() => {
        }}/>);
        const logo = screen.getByAltText('logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', expect.stringContaining('favicon.svg'));
    });

    it('renders the confirmation header message', () => {
        render(<ConfirmationInfo onNavigate={() => {
        }}/>);
        const header = screen.getByText(MESSAGE_HEADER_CONFIRMATION);
        expect(header).toBeInTheDocument();
        expect(header.tagName).toBe('H1');
    });

    it('renders the login prompt', () => {
        render(<ConfirmationInfo onNavigate={() => {
        }}/>);
        expect(screen.getByText(new RegExp(MESSAGE_LOGIN_PROMPT, 'i'))).toBeInTheDocument();
    });

    it('renders the navigation link with correct text', () => {
        render(<ConfirmationInfo onNavigate={() => {
        }}/>);
        expect(screen.getByText('Go to login page')).toBeInTheDocument();
    });
});
