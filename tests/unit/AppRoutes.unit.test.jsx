import {render, screen, cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AppRoutes} from '../../src/AppRoutes';
import {vi, describe, it, expect, afterEach} from 'vitest';

// Mock components to simplify testing
vi.mock('../../src/view/route/Home', () => ({
    default: () => <div data-testid="home-page">Home Page</div>
}));
vi.mock('../../src/view/route/ConfirmationAccount', () => ({
    default: () => <div data-testid="confirmation-page">Confirmation Page</div>
}));
vi.mock('../../src/view/route/Redirect', () => ({
    default: () => <div data-testid="redirect-page">Redirect Page</div>
}));

describe('AppRoutes', () => {
    afterEach(() => {
        cleanup();
    });

    const renderWithRouter = (path) => {
        return render(
            <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppRoutes />
            </MemoryRouter>
        );
    };

    it('renders Home component for "/" path', () => {
        renderWithRouter('/');
        expect(screen.getByTestId('home-page')).toBeDefined();
    });

    it('renders Home component for "/home" path', async () => {
        renderWithRouter('/home');
        expect(await screen.findByTestId('home-page')).toBeDefined();
    });

    it('renders ConfirmationAccount component for "/confirm/:id/:token" path', async () => {
        renderWithRouter('/confirm/1/abc');
        expect(await screen.findByTestId('confirmation-page')).toBeDefined();
    });

    it('renders ConfirmationAccount component for "/confirm" path', async () => {
        renderWithRouter('/confirm');
        expect(await screen.findByTestId('confirmation-page')).toBeDefined();
    });

    it('renders Redirect component for "/redirect" path', () => {
        renderWithRouter('/redirect');
        expect(screen.getByTestId('redirect-page')).toBeDefined();
    });
});
