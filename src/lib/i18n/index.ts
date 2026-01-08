import { derived, writable } from 'svelte/store';
import type { Book, Language } from '$lib/data/types';

const dictionaries: Record<Language, Record<string, string>> = {
	en: {
		brand: 'HobCanon',
		tagline: 'A curated journey through essential readings.',
		nav_home: 'Home',
		nav_books: 'Books',
		nav_authors: 'Authors',
		cta_language: 'Español',
		hero_title: 'Canon & curiosity',
		hero_subtitle: 'Discover influential books and the minds behind them.',
		featured: 'Featured picks',
		spotlight: 'Spotlight authors',
		stats: 'At a glance',
		top_tags: 'Top tags',
		top_genres: 'Top genres',
		top_countries: 'Top countries',
		total_books: 'Books',
		total_authors: 'Authors',
		filters: 'Filters',
		search: 'Search',
		year_range: 'Year',
		country: 'Country',
		period: 'Period',
		language: 'Language',
		format: 'Format',
		genre: 'Genre',
		tag: 'Tag',
		tags: 'Tags',
		difficulty: 'Difficulty',
		importance: 'Importance',
		reset: 'Reset filters',
		results: 'results',
		authors: 'Authors',
		books: 'Books',
		see_book: 'See book',
		see_author: 'See author',
		author_info: 'About the author',
		book_info: 'About the book',
		back_home: 'Back to home',
		empty_state: 'No matches with the current filters.',
		era: 'Era',
		read_more: 'Open details',
		birth: 'Birth',
		death: 'Death',
		stats_blurb: 'Browse a living bookshelf with gentle filters and smart tags.'
	},
	es: {
		brand: 'HobCanon',
		tagline: 'Un recorrido cuidado por lecturas esenciales.',
		nav_home: 'Inicio',
		nav_books: 'Libros',
		nav_authors: 'Autores',
		cta_language: 'English',
		hero_title: 'Canon y curiosidad',
		hero_subtitle: 'Explora obras influyentes y las mentes detrás de ellas.',
		featured: 'Destacados',
		spotlight: 'Autores en foco',
		stats: 'De un vistazo',
		top_tags: 'Etiquetas principales',
		top_genres: 'Géneros principales',
		top_countries: 'Países principales',
		total_books: 'Libros',
		total_authors: 'Autores',
		filters: 'Filtros',
		search: 'Buscar',
		year_range: 'Año',
		country: 'País',
		period: 'Época',
		language: 'Idioma',
		format: 'Formato',
		genre: 'Género',
		tag: 'Etiqueta',
		tags: 'Etiquetas',
		difficulty: 'Dificultad',
		importance: 'Importancia',
		reset: 'Limpiar filtros',
		results: 'resultados',
		authors: 'Autores',
		books: 'Libros',
		see_book: 'Ver libro',
		see_author: 'Ver autor',
		author_info: 'Sobre el autor',
		book_info: 'Sobre el libro',
		back_home: 'Volver al inicio',
		empty_state: 'No hay coincidencias con los filtros.',
		era: 'Época',
		read_more: 'Abrir detalle',
		birth: 'Nacimiento',
		death: 'Fallecimiento',
		stats_blurb: 'Explora esta estantería viva con filtros suaves y etiquetas inteligentes.'
	}
};

export const locale = writable<Language>('en');

export const t = derived(locale, ($locale) => (key: string) => dictionaries[$locale]?.[key] ?? key);

export const toggleLocale = (): void =>
	locale.update((lang) => {
		const next = lang === 'en' ? 'es' : 'en';
		if (typeof document !== 'undefined') {
			document.documentElement.lang = next;
		}
		return next;
	});

export const translate = (key: string, lang: Language): string =>
	dictionaries[lang]?.[key] ?? key;

export const titleFor = (book: Book, lang: Language): string => {
	if (lang === 'en') {
		return book.title_en ?? book.title_es ?? book.title_orig ?? 'Untitled';
	}
	return book.title_es ?? book.title_en ?? book.title_orig ?? 'Sin título';
};

const languageNames = new Map<Language, Intl.DisplayNames>();
const countryNames = new Map<Language, Intl.DisplayNames>();
const languageToFlag: Record<string, string> = {
	en: 'GB',
	es: 'ES',
	fr: 'FR',
	de: 'DE',
	it: 'IT',
	pt: 'PT',
	ru: 'RU',
	ja: 'JP',
	zh: 'CN',
	ko: 'KR',
	ar: 'SA',
	el: 'GR'
};

const getLanguageNames = (lang: Language) => {
	if (!languageNames.has(lang)) {
		languageNames.set(lang, new Intl.DisplayNames([lang], { type: 'language' }));
	}
	return languageNames.get(lang)!;
};

const getCountryNames = (lang: Language) => {
	if (!countryNames.has(lang)) {
		countryNames.set(lang, new Intl.DisplayNames([lang], { type: 'region' }));
	}
	return countryNames.get(lang)!;
};

export const flagFromCountry = (code: string | null | undefined): string => {
	if (!code || !/^[A-Za-z]{2}$/.test(code)) return '';
	const upper = code.toUpperCase();
	return String.fromCodePoint(...[...upper].map((char) => 127397 + char.charCodeAt(0)));
};

export const formatLanguage = (code: string | null | undefined, lang: Language): string => {
	if (!code) return '—';
	const normalized = code.toLowerCase();
	const flagCode = languageToFlag[normalized] ?? (normalized.length === 2 ? normalized.toUpperCase() : '');
	const flag = flagCode ? flagFromCountry(flagCode) : '';
	const name = formatLanguageName(code, lang);
	return flag ? `${flag} ${name}` : name;
};

export const formatLanguageName = (code: string | null | undefined, lang: Language): string => {
	if (!code) return '—';
	try {
		return getLanguageNames(lang).of(code) ?? code.toUpperCase();
	} catch {
		return code.toUpperCase();
	}
};

export const flagForLanguage = (code: string | null | undefined): string => {
	if (!code) return '';
	const normalized = code.toLowerCase();
	const flagCode = languageToFlag[normalized] ?? (normalized.length === 2 ? normalized.toUpperCase() : '');
	return flagCode ? flagFromCountry(flagCode) : '';
};

export const formatCountry = (code: string | null | undefined, lang: Language): string => {
	if (!code) return '—';
	const flag = flagFromCountry(code);
	const name = formatCountryName(code, lang);
	return flag ? `${flag} ${name}` : name;
};

export const formatCountryName = (code: string | null | undefined, lang: Language): string => {
	if (!code) return '—';
	try {
		return getCountryNames(lang).of(code) ?? code.toUpperCase();
	} catch {
		return code.toUpperCase();
	}
};
