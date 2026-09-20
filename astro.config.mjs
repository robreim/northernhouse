import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Eigen domein op de root: geen `base` nodig.
  site: 'https://northernhouse.nl',
  vite: {
    plugins: [tailwindcss()],
  },
});
