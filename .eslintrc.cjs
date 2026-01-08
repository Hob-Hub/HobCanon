export default {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['build/', '.svelte-kit/', 'node_modules/'],
	env: {
		browser: true,
		es2021: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			},
			extends: ['plugin:svelte/recommended', 'prettier']
		}
	]
};
