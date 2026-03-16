import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // In production (GitHub Pages) use the repo sub-path; locally use root
  base: mode === 'production' ? '/rtbs-project/' : '/',
  server: {
    port: 3000,
  },
}));
