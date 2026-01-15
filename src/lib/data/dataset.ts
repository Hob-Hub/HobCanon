import authorsRaw from './authors.json';
import booksRaw from './books.json';
import { slugify } from './slug';
import type { Author, Book, Count, Dataset, Facets, Stats } from './types';

type Index = {
	authorsBySlug: Map<string, Author>;
	authorsByName: Map<string, Author>;
	booksBySlug: Map<string, Book>;
};

const normalize = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

const countValues = (values: (string | null | undefined)[], limit: number): Count[] => {
	const counts = new Map<string, number>();
	for (const raw of values) {
		if (!raw) continue;
		const key = raw.trim();
		if (!key) continue;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
	.map(([value, count]) => ({ value, count }));
};

const makeUniqueSlug = (base: string, seen: Map<string, number>): string => {
	const current = seen.get(base) ?? 0;
	if (current === 0) {
		seen.set(base, 1);
		return base;
	}
	const next = current + 1;
	seen.set(base, next);
	return `${base}-${next}`;
};

const buildDataset = (): Dataset & { index: Index } => {
	const slugRegistry = new Map<string, number>();
	const authors: Author[] = authorsRaw.map((author) => {
		const baseSlug = slugify(author.name);
		const slug = makeUniqueSlug(baseSlug, slugRegistry);
		return {
			name: author.name,
			alias: author.alias ?? null,
			birth_year: author.birth_year ?? null,
			death_year: author.death_year ?? null,
			country: author.country ?? null,
			url_wikipedia: author.url_wikipedia ?? null,
			url_photo: author.url_photo ?? null,
			slug,
			bookCount: 0
		};
	});

	const authorsBySlug = new Map<string, Author>();
	const authorsByName = new Map<string, Author>();
	for (const author of authors) {
		authorsBySlug.set(author.slug, author);
		authorsByName.set(normalize(author.name), author);
		if (author.alias) {
			authorsByName.set(normalize(author.alias), author);
		}
	}

	const books: Book[] = booksRaw.map((book) => {
		const match = authorsByName.get(normalize(book.author));
		const tags = Array.isArray(book.tags) ? book.tags : [];
		const baseSlug = slugify(book.title_es);
		const slug = makeUniqueSlug(baseSlug, slugRegistry);

		if (match) {
			match.bookCount += 1;
		}

		return {
			title_es: book.title_es,
			title_en: book.title_en ?? null,
			title_orig: book.title_orig ?? null,
			author: book.author,
			year: book.year ?? null,
			pages: book.pages ?? null,
			lang: book.lang ?? null,
			url_openlibrary: book.url_openlibrary ?? null,
			url_photo: book.url_photo ?? null,
			difficulty: book.difficulty ?? null,
			importance: book.importance ?? null,
			genre: book.genre ?? null,
			format: (book.format as Book['format']) ?? null,
			country: book.country ?? null,
			period: book.period ?? null,
			tags,
			slug,
			authorSlug: match?.slug ?? null
		};
	});

	const booksBySlug = new Map<string, Book>();
	for (const book of books) {
		booksBySlug.set(book.slug, book);
	}

	const stats: Stats = {
		totalBooks: books.length,
		totalAuthors: authors.length,
		topTags: countValues(
			books.flatMap((book) => book.tags),
			10
		),
		topGenres: countValues(
			books.map((book) => book.genre),
			6
		),
		topCountries: countValues(
			books.map((book) => book.country),
			6
		)
	};

	const facets: Facets = {
		countries: [...new Set(books.map((b) => b.country).filter((value): value is string => !!value))].sort(),
		languages: [...new Set(books.map((b) => b.lang).filter((value): value is string => !!value))].sort(),
		formats: [
			...new Set(books.map((b) => b.format).filter((value): value is NonNullable<Book['format']> => !!value))
		].sort(),
		genres: [...new Set(books.map((b) => b.genre).filter((value): value is string => !!value))].sort(),
		tags: countValues(
			books.flatMap((b) => b.tags),
			25
		).map((item) => item.value),
		periods: [...new Set(books.map((b) => b.period).filter((value): value is string => !!value))].sort()
	};

	return {
		books,
		authors,
		stats,
		facets,
		index: {
			authorsByName,
			authorsBySlug,
			booksBySlug
		}
	};
};

const dataset = buildDataset();

export const getDataset = (): Dataset => ({
	books: dataset.books,
	authors: dataset.authors,
	stats: dataset.stats,
	facets: dataset.facets
});

export const getBookBySlug = (slug: string): Book | undefined => dataset.index.booksBySlug.get(slug);

export const getAuthorBySlug = (slug: string): Author | undefined =>
	dataset.index.authorsBySlug.get(slug);

export const getBooksByAuthorSlug = (slug: string): Book[] =>
	dataset.books.filter((book) => book.authorSlug === slug);
