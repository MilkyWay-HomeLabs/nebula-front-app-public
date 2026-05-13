import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { handleNavigate, RenderLink, NAVIGATE_LOGIN } from '../../../src/util/NavigationUtils';

describe('NavigationUtils', () => {
    describe('handleNavigate', () => {
        it('should call onNavigate with correct page', () => {
            const onNavigate = vi.fn();
            handleNavigate(onNavigate, 'test-page');
            expect(onNavigate).toHaveBeenCalledWith('test-page');
        });

        it('should not throw if onNavigate is not a function', () => {
            expect(() => handleNavigate(null, 'page')).not.toThrow();
        });
    });

    describe('RenderLink', () => {
        it('should render link with text', () => {
            render(<RenderLink text="Click me" page={NAVIGATE_LOGIN} onNavigate={() => {}} />);
            expect(screen.getByText('Click me')).toBeInTheDocument();
            expect(screen.getByText('Click me')).toHaveClass('span-link');
        });

        it('should call onNavigate when clicked', () => {
            const onNavigate = vi.fn();
            render(<RenderLink text="Login" page={NAVIGATE_LOGIN} onNavigate={onNavigate} />);
            fireEvent.click(screen.getByText('Login'));
            expect(onNavigate).toHaveBeenCalledWith(NAVIGATE_LOGIN);
        });
    });
});
