import { getAuthorBySlug, getBookBySlug } from '$lib/data/dataset';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
	const book = getBookBySlug(params.slug);
	if (!book) {
		throw error(404, 'Book not found');
	}

	const author = book.authorSlug ? getAuthorBySlug(book.authorSlug) ?? null : null;

	return { book, author };
}) satisfies PageLoad;
