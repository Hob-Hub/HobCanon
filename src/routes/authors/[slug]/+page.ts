import { getAuthorBySlug, getBooksByAuthorSlug } from '$lib/data/dataset';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
	const author = getAuthorBySlug(params.slug);
	if (!author) {
		throw error(404, 'Author not found');
	}

	const books = getBooksByAuthorSlug(author.slug);

	return { author, books };
}) satisfies PageLoad;
