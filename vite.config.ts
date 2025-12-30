import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    fs: {
      // Allows serving files from one level up (fixes nk-technologies/cache issues)
      allow: [searchForWorkspaceRoot(process.cwd()), '..']
    }
  }
});