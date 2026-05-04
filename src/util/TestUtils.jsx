import {MemoryRouter} from "react-router-dom";

/**
 * A wrapper component for testing that provides a MemoryRouter with a default configuration.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to wrap with the router.
 * @returns {JSX.Element}
 */
export const TestMemoryRouterWrapper = ({ children }) => (
    <MemoryRouter
        basename="/nebula/app"
        initialEntries={['/nebula/app']}
        future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }}
    >
        {children}
    </MemoryRouter>
);

/**
 * A wrapper component for testing that provides a MemoryRouter with custom paths.
 *
 * @param {Object} props
 * @param {string[]} props.path - Array of relative paths to include in the initial entries.
 * @param {React.ReactNode} props.children - The components to wrap with the router.
 * @returns {JSX.Element}
 */
export const TestMemoryRouterWithPathWrapper = ({ path, children }) => (
    <MemoryRouter
        basename="/nebula/app"
        initialEntries={path.map(p => `/nebula/app${p}`)}
        future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }}
    >
        {children}
    </MemoryRouter>
);
