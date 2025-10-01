import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const BACKEND_URL = env.API_URL || `http://localhost:${env.PORT || 3000}`;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/students': {
          target: BACKEND_URL,
          changeOrigin: true,
        },
        '/courses': {
          target: BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  }
});
