import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Centralise la configuration Vite du frontend.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4174,
  },
});
