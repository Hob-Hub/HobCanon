/// <reference types="node" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const base = process.env.BASE_PATH ?? (process.env.NODE_ENV === 'development' ? '' : '/HobCanon');

export default defineConfig({
	plugins: [sveltekit()],
	base
});
