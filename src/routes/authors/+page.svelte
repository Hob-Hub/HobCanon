<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import { filterAuthors, sortAuthors, type AuthorFilters, type AuthorSortOption } from '$lib/authors/filters';
	import { flagFromCountry, formatCountryName, locale, t } from '$lib/i18n';
	import type { Book } from '$lib/data/types';
	import type { PageData } from './$types';

	export let data: PageData;

	const years = data.authors
		.flatMap((author) => [author.birth_year, author.death_year])
		.filter((year): year is number => typeof year === 'number');
	const minYear = years.length ? Math.min(...years) : 0;
	const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();

	let search = '';
	let country = '';
	let eraFrom = minYear;
	let eraTo = maxYear;
	let minBookCount = '';
	let sortOption: AuthorSortOption = 'books';

	type AuthorSummary = {
		genres: string[];
		tags: string[];
	};

	const buildAuthorSummaries = (books: Book[]): Record<string, AuthorSummary> => {
		const genreCountsByAuthor = new Map<string, Map<string, number>>();
		const tagCountsByAuthor = new Map<string, Map<string, number>>();

		for (const book of books) {
			if (!book.authorSlug) continue;

			if (book.genre) {
				let genreCounts = genreCountsByAuthor.get(book.authorSlug);
				if (!genreCounts) {
					genreCounts = new Map<string, number>();
					genreCountsByAuthor.set(book.authorSlug, genreCounts);
				}
				genreCounts.set(book.genre, (genreCounts.get(book.genre) ?? 0) + 1);
			}

			if (book.tags.length) {
				let tagCounts = tagCountsByAuthor.get(book.authorSlug);
				if (!tagCounts) {
					tagCounts = new Map<string, number>();
					tagCountsByAuthor.set(book.authorSlug, tagCounts);
				}
				for (const tag of book.tags) {
					tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
				}
			}
		}

		const summaries = new Map<string, AuthorSummary>();

		for (const [slug, genreCounts] of genreCountsByAuthor) {
			const topGenres = [...genreCounts.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 2)
				.map(([genre]) => genre);

			const tagCounts = tagCountsByAuthor.get(slug);
			const topTags = tagCounts
				? [...tagCounts.entries()]
						.sort((a, b) => b[1] - a[1])
						.slice(0, 2)
						.map(([tag]) => tag)
				: [];

			summaries.set(slug, { genres: topGenres, tags: topTags });
		}

		for (const [slug, tagCounts] of tagCountsByAuthor) {
			if (summaries.has(slug)) continue;

			const topTags = [...tagCounts.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 2)
				.map(([tag]) => tag);

			summaries.set(slug, { genres: [], tags: topTags });
		}

		return Object.fromEntries(summaries.entries());
	};

	const authorSummaries = buildAuthorSummaries(data.books);

	const resetFilters = () => {
		search = '';
		country = '';
		eraFrom = minYear;
		eraTo = maxYear;
		minBookCount = '';
		sortOption = 'books';
	};

	const buildFilters = (): AuthorFilters => ({
		search,
		country,
		eraFrom,
		eraTo,
		minBookCount
	});

	$: filtered = sortAuthors(filterAuthors(data.authors, buildFilters()), sortOption);
</script>

<section class="grid gap-6 md:grid-cols-[minmax(0,260px),1fr]">
	<aside>
		<div class="rounded-3xl bg-white/70 p-6 shadow-soft space-y-4">
			<div class="flex flex-col gap-2">
				<div>
					<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('filters')}</p>
					<h1 class="font-display text-3xl text-ink">{$t('authors')}</h1>
				</div>
				<button
					type="button"
					class="badge bg-ink text-white w-max"
					onclick={resetFilters}
				>
					{$t('reset')}
				</button>
			</div>

			<div class="grid gap-4">
				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('search')}</span>
					<input
						class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2"
						type="search"
						placeholder={$t('search_placeholder_authors')}
						bind:value={search}
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('country')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={country}>
						<option value="">{'—'}</option>
						{#each data.facets.countries as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('era')}</span>
					<div class="flex gap-2">
						<input
							class="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2"
							type="number"
							bind:value={eraFrom}
							min={minYear}
							max={eraTo}
						/>
						<input
							class="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2"
							type="number"
							bind:value={eraTo}
							min={eraFrom}
							max={maxYear}
						/>
					</div>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('min_books') ?? 'Min. books in canon'}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={minBookCount}>
						<option value="">{'—'}</option>
						<option value="1">1+</option>
						<option value="2">2+</option>
						<option value="3">3+</option>
						<option value="5">5+</option>
					</select>
				</label>
			</div>
		</div>
	</aside>

	<div class="space-y-4">
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<p class="text-sm text-ink/70">
				{filtered.length} {$t('results')}
			</p>
			<div class="flex items-center gap-2 text-sm">
				<label for="author-sort" class="text-ink/70">{$t('sort_by') ?? 'Sort by'}</label>
				<select
					id="author-sort"
					class="rounded-xl border border-ink/10 bg-white/80 px-3 py-2"
					bind:value={sortOption}
				>
					<option value="books">{$t('sort_books') ?? 'Books in canon'}</option>
					<option value="name">{$t('sort_name') ?? 'Name'}</option>
					<option value="birth">{$t('birth') ?? 'Birth'}</option>
				</select>
			</div>
		</div>

		{#if search || country || minBookCount || eraFrom !== minYear || eraTo !== maxYear}
			<div class="flex flex-wrap gap-2 text-xs">
				{#if search}
					<button
						type="button"
						class="badge bg-ink text-white"
						onclick={() => (search = '')}
					>
						{$t('search')}: "{search}" ✕
					</button>
				{/if}
				{#if country}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (country = '')}
					>
						{$t('country')}: {country} ✕
					</button>
				{/if}
				{#if minBookCount}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (minBookCount = '')}
					>
						{$t('min_books') ?? 'Min. books'}: {minBookCount}+ ✕
					</button>
				{/if}
				{#if eraFrom !== minYear || eraTo !== maxYear}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => {
							eraFrom = minYear;
							eraTo = maxYear;
						}}
					>
						{$t('era')}: {eraFrom}–{eraTo} ✕
					</button>
				{/if}
			</div>
		{/if}

		{#if filtered.length === 0}
			<div class="card text-center text-ink/70">{$t('empty_state')}</div>
		{:else}
			<div class="grid gap-4">
				{#each filtered as author (author.slug)}
					<article class="card grid gap-2 md:grid-cols-[1fr,auto] md:items-center">
						<div class="space-y-1">
							<h2 class="font-display text-2xl text-ink">
								<a href={`${base}/authors/${author.slug}/`}>{author.name}</a>
							</h2>
							<p class="text-sm text-ink/70">
								{#if author.birth_year || author.death_year}
									{author.birth_year ?? '—'}{author.death_year ? ` — ${author.death_year}` : ''}
								{/if}
								{#if author.country}
									{#if author.birth_year || author.death_year}
										&nbsp;•&nbsp;
									{/if}
									<span class="inline-flex items-center gap-1">
										<span class="flag">{flagFromCountry(author.country)}</span>
										{formatCountryName(author.country, $locale)}
									</span>
								{/if}
								{#if !author.birth_year && !author.death_year && !author.country}
									{$t('not_available')}
								{/if}
							</p>
							<p class="text-sm text-ink/60">{author.bookCount} {$t('books')}</p>
							{#if authorSummaries[author.slug]}
								<div class="mt-2 flex flex-wrap gap-2 text-xs">
									{#if authorSummaries[author.slug].genres.length}
										<span class="badge bg-sand text-ink">
											{authorSummaries[author.slug].genres.join(' · ')}
										</span>
									{/if}
									{#if authorSummaries[author.slug].tags.length}
										<span class="badge bg-amber/30 text-ink">
											{authorSummaries[author.slug].tags.join(' · ')}
										</span>
									{/if}
								</div>
							{/if}
						</div>
						<div class="flex flex-col items-stretch gap-2 md:items-end">
							<a
								class="badge bg-ink text-white"
								href={`${base}/authors/${author.slug}/`}
							>
								{$t('see_author')}
							</a>
							<a
								class="badge bg-amber text-ink"
								href={`${base}/books/?author=${author.slug}`}
							>
								{$t('books')}
							</a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>
