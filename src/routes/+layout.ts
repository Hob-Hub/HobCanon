import { getDataset } from '$lib/data/dataset';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const trailingSlash = 'always';

export const load = (async () => {
	const { books, authors, stats, facets } = getDataset();
	return { books, authors, stats, facets };
}) satisfies LayoutLoad;
