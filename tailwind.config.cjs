/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Playfair Display"', 'serif'],
				sans: ['"Newsreader"', 'ui-serif']
			},
			colors: {
				ink: '#0f172a',
				mist: '#f6f3ee',
				sand: '#e7dfd5',
				amber: '#f59e0b',
				plum: '#7c3aed'
			},
			boxShadow: {
				soft: '0 10px 30px rgba(15, 23, 42, 0.12)'
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
};
