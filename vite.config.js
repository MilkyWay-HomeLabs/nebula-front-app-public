import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    const base = env.VITE_PUBLIC_URL || "/";

    return {
        plugins: [
            react(),
            {
                name: 'handle-traefik-strip-prefix',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        // If Traefik removed the prefix, Vite receives the URL without it.
                        // Vite with base set expects the path to start with that prefix.
                        // If the path does not start with base, we prepend it so Vite can recognize and serve the resource.
                        if (!req.url.startsWith(base)) {
                            req.url = base + req.url.replace(/^\/+/, '');
                        }
                        next();
                    });
                }
            }
        ],
        base: base,
        server: {
            host: "0.0.0.0",
            port: 5173,
            allowedHosts: ["milkyway.test"],
            strictPort: true,
            hmr: {
                host: "milkyway.test",
                clientPort: 443,
                protocol: "wss",
                path: "/@vite-hmr",
            },
        },
        test: {
            globals: false,
            environment: 'jsdom',
            // jsdom defaults to the opaque "about:blank" origin, where the Web Storage
            // API is unavailable (`localStorage` is undefined). Pin a concrete origin so
            // localStorage/sessionStorage work in tests that exercise token persistence.
            environmentOptions: {
                jsdom: {
                    url: 'http://localhost',
                },
            },
            setupFiles: ['./src/test/setup.js'],
            include: [
                'tests/unit/**/*.test.{js,jsx,ts,tsx}',
                'tests/integration/**/*.test.{js,jsx,ts,tsx}',
                'src/**/*.test.{js,jsx,ts,tsx}'
            ],
            exclude: ['tests/e2e/**', 'tests/**/*.spec.js'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'html'],
                reportsDirectory: './coverage',
            },
        },
    };
});
