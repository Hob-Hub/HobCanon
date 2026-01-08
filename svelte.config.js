/// <reference types="node" />
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV === 'development';
const base = process.env.BASE_PATH ?? (dev ? '' : '/HobCanon');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			stripTrailingSlash: false
		}),
		paths: {
			base
		}
	}
};

export default config;
