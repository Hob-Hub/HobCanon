import { getAuthorBySlug, getBookBySlug, getDataset } from '$lib/data/dataset';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
	const book = getBookBySlug(params.slug);
	if (!book) {
		throw error(404, 'Book not found');
	}

	const author = book.authorSlug ? getAuthorBySlug(book.authorSlug) ?? null : null;

	const { books } = getDataset();

	const sameAuthor = author
		? books
			.filter((candidate) => candidate.authorSlug === author.slug && candidate.slug !== book.slug)
			.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
			.slice(0, 6)
		: [];

	const similar = books
		.filter((candidate) => {
			if (candidate.slug === book.slug) return false;
			if (author && candidate.authorSlug === author.slug) return false;
			if (book.genre && candidate.genre !== book.genre) return false;
			if (book.period && candidate.period !== book.period) return false;
			if (book.difficulty && candidate.difficulty) {
				return Math.abs(candidate.difficulty - book.difficulty) <= 1;
			}
			return true;
		})
		.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
		.slice(0, 6);

	return { book, author, sameAuthor, similar };
}) satisfies PageLoad;
