import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { TestMemoryRouterWrapper, TestMemoryRouterWithPathWrapper } from '../../../src/util/TestUtils';

const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
};

describe('TestUtils', () => {
    beforeEach(() => {
        cleanup();
    });

    describe('TestMemoryRouterWrapper', () => {
        it('should provide default router context', () => {
            render(
                <TestMemoryRouterWrapper>
                    <LocationDisplay />
                </TestMemoryRouterWrapper>
            );
            expect(screen.getByTestId('location').textContent).toBe('/');
        });
    });

    describe('TestMemoryRouterWithPathWrapper', () => {
        it('should provide router context with specific path', () => {
            render(
                <TestMemoryRouterWithPathWrapper path={['/settings']}>
                    <LocationDisplay />
                </TestMemoryRouterWithPathWrapper>
            );
            expect(screen.getByTestId('location').textContent).toBe('/settings');
        });
    });
});
