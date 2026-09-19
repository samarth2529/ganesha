import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/dist/**', '**/public/assets/*.glb']
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf']
});
