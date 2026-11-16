import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()], build:{rollupOptions:{input:{index:decodeURIComponent(new URL('./index.html',import.meta.url).pathname),popup:decodeURIComponent(new URL('./popup.html',import.meta.url).pathname),sidepanel:decodeURIComponent(new URL('./sidepanel.html',import.meta.url).pathname)}}}});
