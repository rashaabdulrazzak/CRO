import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCommonjs(), // This fixes the ESM/CommonJS issues
  ],
  css: {
    postcss: {
      plugins: [ autoprefixer],
    },
  },
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
  worker: {
    format: 'es',
  },
  assetsInclude: ['**/*.dcm', '**/*.dicom'], // Include DICOM files as assets
});
