export type Language = 'en' | 'es';

export type Author = {
	name: string;
	alias: string | null;
	birth_year: number | null;
	death_year: number | null;
	country: string | null;
	slug: string;
	bookCount: number;
};

export type Book = {
	title_es: string;
	title_en: string | null;
	title_orig: string | null;
	author: string;
	year: number | null;
	pages: number | null;
	lang: string | null;
	difficulty: number | null;
	importance: number | null;
	genre: string | null;
	format: 'prose' | 'poetry' | 'play' | null;
	country: string | null;
	period: string | null;
	tags: string[];
	slug: string;
	authorSlug: string | null;
};

export type Count = {
	value: string;
	count: number;
};

export type Stats = {
	totalBooks: number;
	totalAuthors: number;
	topTags: Count[];
	topGenres: Count[];
	topCountries: Count[];
};

export type Facets = {
	countries: string[];
	languages: string[];
	formats: string[];
	genres: string[];
	tags: string[];
	periods: string[];
};

export type Dataset = {
	books: Book[];
	authors: Author[];
	stats: Stats;
	facets: Facets;
};
