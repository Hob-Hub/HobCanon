import type { Book, Language } from '$lib/data/types';
import { titleFor } from '$lib/i18n';

export type BookSortOption = 'canonical' | 'year' | 'difficulty' | 'title';

export type BookFilters = {
	search: string;
	country: string;
	language: string;
	format: string;
	genre: string;
	tag: string;
	period: string;
	difficultyMin: string; // numeric string or ''
	importanceMin: string; // numeric string or ''
	yearFrom: number;
	yearTo: number;
	authorSlug: string;
};

const matchesRange = (value: number | null, from: number, to: number) =>
	value === null || (value >= from && value <= to);

export const filterBooks = (
	books: Book[],
	filters: BookFilters,
	lang: Language
): Book[] => {
	const query = filters.search.trim().toLowerCase();
	const difficultyMin = filters.difficultyMin ? parseInt(filters.difficultyMin, 10) : null;
	const importanceMin = filters.importanceMin ? parseInt(filters.importanceMin, 10) : null;

	return books.filter((book) => {
		// text search
		let matchesQuery = true;
		if (query) {
			const title = titleFor(book, lang).toLowerCase();
			matchesQuery =
				title.includes(query) ||
				book.author.toLowerCase().includes(query) ||
				(book.genre ?? '').toLowerCase().includes(query);
		}

		if (!matchesQuery) return false;

		// facet filters
		if (filters.country && book.country !== filters.country) return false;
		if (filters.language && book.lang !== filters.language) return false;
		if (filters.format && book.format !== filters.format) return false;
		if (filters.genre && book.genre !== filters.genre) return false;
		if (filters.tag && !book.tags.includes(filters.tag)) return false;
		if (filters.period && book.period !== filters.period) return false;
		if (filters.authorSlug && book.authorSlug !== filters.authorSlug) return false;

		if (difficultyMin !== null && (book.difficulty ?? 0) < difficultyMin) return false;
		if (importanceMin !== null && (book.importance ?? 0) < importanceMin) return false;

		if (!matchesRange(book.year, filters.yearFrom, filters.yearTo)) return false;

		return true;
	});
};

export const sortBooks = (
	books: Book[],
	lang: Language,
	option: BookSortOption
): Book[] => {
	const copy = [...books];

	switch (option) {
		case 'year':
			copy.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
			break;
		case 'difficulty':
			copy.sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0));
			break;
		case 'title':
			copy.sort((a, b) => {
				const ta = titleFor(a, lang).toLowerCase();
				const tb = titleFor(b, lang).toLowerCase();
				return ta.localeCompare(tb);
			});
			break;
		case 'canonical':
		default:
			copy.sort((a, b) => {
				const impDiff = (b.importance ?? 0) - (a.importance ?? 0);
				if (impDiff !== 0) return impDiff;
				return (a.difficulty ?? 0) - (b.difficulty ?? 0);
			});
	}

	return copy;
};
