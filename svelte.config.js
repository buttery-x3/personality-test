import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = (process.env.VITE_BASE_PATH ?? '').replace(/\/+$/, '');
const output = process.env.BUILD_DIR ?? 'build';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: output, assets: output }),
    paths: { base, relative: false }
  }
};
