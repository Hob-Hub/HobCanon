import type { Author } from '$lib/data/types';

export type AuthorFilters = {
	search: string;
	country: string;
	eraFrom: number;
	eraTo: number;
	minBookCount: string; // numeric string or ''
};

export type AuthorSortOption = 'books' | 'name' | 'birth';

const matchesRange = (value: number | null, from: number, to: number) =>
	value === null || (value >= from && value <= to);

export const filterAuthors = (authors: Author[], filters: AuthorFilters): Author[] => {
	const query = filters.search.trim().toLowerCase();
	const minCount = filters.minBookCount ? parseInt(filters.minBookCount, 10) : null;

	return authors.filter((author) => {
		if (query) {
			const name = author.name.toLowerCase();
			const alias = (author.alias ?? '').toLowerCase();
			if (!name.includes(query) && !alias.includes(query)) return false;
		}

		if (filters.country && author.country !== filters.country) return false;

		const coreYear = author.birth_year ?? author.death_year;
		if (!matchesRange(coreYear, filters.eraFrom, filters.eraTo)) return false;

		if (minCount !== null && author.bookCount < minCount) return false;

		return true;
	});
};

export const sortAuthors = (authors: Author[], option: AuthorSortOption): Author[] => {
	const copy = [...authors];

	switch (option) {
		case 'name':
			copy.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case 'birth':
			copy.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0));
			break;
		case 'books':
		default:
			copy.sort((a, b) => b.bookCount - a.bookCount || a.name.localeCompare(b.name));
	}

	return copy;
};
