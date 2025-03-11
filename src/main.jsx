import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Root is project directory
  publicDir: 'public', // Public folder for static assets
  server: {
    open: true // Auto-open browser
  }
});