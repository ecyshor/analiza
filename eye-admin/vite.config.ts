import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        envPrefix: 'REACT_APP',
        server: {
            host: true,
            port: 5174
        },
        base: './',
        resolve: {
            alias: env.VITE_E2E_MOCK_AUTH === 'true' ? {
                '@auth0/auth0-react': path.resolve(__dirname, './src/mocks/auth0.tsx')
            } : {}
        }
    };
});
