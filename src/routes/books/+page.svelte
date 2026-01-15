<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import BookCard from '$lib/components/BookCard.svelte';
	import { filterBooks, sortBooks, type BookFilters, type BookSortOption } from '$lib/books/filters';
	import { formatCountryName, formatLanguageName, locale, t } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;

	const years = data.books.map((b) => b.year).filter((y): y is number => typeof y === 'number');
	const minYear = years.length ? Math.min(...years) : 0;
	const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();

	let search = '';
	let country = '';
	let language = '';
	let format = '';
	let genre = '';
	let tag = '';
	let period = '';
	let difficulty = '';
	let importance = '';
	let yearFrom = minYear;
	let yearTo = maxYear;
	let authorSlug = '';
	let sortOption: BookSortOption = 'canonical';

	let initializedFromUrl = false;

	const resetFilters = () => {
		search = '';
		country = '';
		language = '';
		format = '';
		genre = '';
		tag = '';
		period = '';
		difficulty = '';
		importance = '';
		yearFrom = minYear;
		yearTo = maxYear;
		authorSlug = '';
		sortOption = 'canonical';
		if (typeof window !== 'undefined') {
			goto(base + '/books/', { replaceState: true, noScroll: true });
		}
	};

	const buildFilters = (): BookFilters => ({
		search,
		country,
		language,
		format,
		genre,
		tag,
		period,
		difficultyMin: difficulty,
		importanceMin: importance,
		yearFrom,
		yearTo,
		authorSlug
	});

	$: if (!initializedFromUrl) {
		const url = $page.url;
		const slugFromUrl = url.searchParams.get('author') ?? '';
		const tagFromUrl = url.searchParams.get('tag') ?? '';
		const genreFromUrl = url.searchParams.get('genre') ?? '';
		const countryFromUrl = url.searchParams.get('country') ?? '';
		const languageFromUrl = url.searchParams.get('language') ?? '';
		const formatFromUrl = url.searchParams.get('format') ?? '';

		authorSlug = slugFromUrl;
		tag = tagFromUrl;
		genre = genreFromUrl;
		country = countryFromUrl;
		language = languageFromUrl;
		format = formatFromUrl;

		initializedFromUrl = true;
	}

	$: filtered = sortBooks(filterBooks(data.books, buildFilters(), $locale), $locale, sortOption);
</script>

<section class="grid gap-6 md:grid-cols-[minmax(0,260px),1fr]">
	<aside>
		<div class="rounded-3xl bg-white/70 p-6 shadow-soft space-y-4">
			<div class="flex flex-col gap-2">
				<div>
					<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('filters')}</p>
					<h1 class="font-display text-3xl text-ink">{$t('books')}</h1>
				</div>
				<button type="button" class="badge bg-ink text-white w-max" onclick={resetFilters}>
					{$t('reset')}
				</button>
			</div>

			<div class="grid gap-4">
				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('search')}</span>
					<input
						class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2"
						type="search"
						placeholder={$t('search_placeholder_books')}
						bind:value={search}
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('year_range')}</span>
					<div class="flex gap-2">
						<input
							class="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2"
							type="number"
							bind:value={yearFrom}
							min={minYear}
							max={yearTo}
						/>
						<input
							class="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2"
							type="number"
							bind:value={yearTo}
							min={yearFrom}
							max={maxYear}
						/>
					</div>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('country')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={country}>
						<option value="">{'—'}</option>
						{#each data.facets.countries as option}
							<option value={option}>{formatCountryName(option, $locale)}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('language')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={language}>
						<option value="">{'—'}</option>
						{#each data.facets.languages as option}
							<option value={option}>{formatLanguageName(option, $locale)}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('format')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={format}>
						<option value="">{'—'}</option>
						{#each data.facets.formats as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('genre')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={genre}>
						<option value="">{'—'}</option>
						{#each data.facets.genres as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('tags')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={tag}>
						<option value="">{'—'}</option>
						{#each data.facets.tags as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('period')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={period}>
						<option value="">{'—'}</option>
						{#each data.facets.periods as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('difficulty')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={difficulty}>
						<option value="">{'—'}</option>
						{#each [1, 2, 3, 4, 5] as value}
							<option value={value}>{value}+</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm">
					<span class="text-ink/70">{$t('importance')}</span>
					<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={importance}>
						<option value="">{'—'}</option>
						{#each [1, 2, 3, 4, 5] as value}
							<option value={value}>{value}+</option>
						{/each}
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
				<label for="sort" class="text-ink/70">{$t('sort_by') ?? 'Sort by'}</label>
				<select
					id="sort"
					class="rounded-xl border border-ink/10 bg-white/80 px-3 py-2"
					bind:value={sortOption}
				>
					<option value="canonical">{$t('sort_canonical') ?? 'Canonical relevance'}</option>
					<option value="year">{$t('year_range')}</option>
					<option value="difficulty">{$t('difficulty')}</option>
					<option value="title">{$t('sort_title') ?? 'Title'}</option>
				</select>
			</div>
		</div>

		{#if search || country || language || format || genre || tag || period || difficulty || importance || authorSlug}
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
				{#if language}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (language = '')}
					>
						{$t('language')}: {language} ✕
					</button>
				{/if}
				{#if format}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (format = '')}
					>
						{$t('format')}: {format} ✕
					</button>
				{/if}
				{#if genre}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (genre = '')}
					>
						{$t('genre')}: {genre} ✕
					</button>
				{/if}
				{#if tag}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (tag = '')}
					>
						{$t('tag')}: {tag} ✕
					</button>
				{/if}
				{#if period}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (period = '')}
					>
						{$t('period')}: {period} ✕
					</button>
				{/if}
				{#if authorSlug}
					{#each data.authors as author (author.slug)}
						{#if author.slug === authorSlug}
							<a class="badge bg-sand text-ink" href={base + '/books/'}>
								{$t('authors')}: {author.name} ✕
							</a>
						{/if}
					{/each}
				{/if}
				{#if difficulty}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (difficulty = '')}
					>
						{$t('difficulty')}: {difficulty}+ ✕
					</button>
				{/if}
				{#if importance}
					<button
						type="button"
						class="badge bg-sand text-ink"
						onclick={() => (importance = '')}
					>
						{$t('importance')}: {importance}+ ✕
					</button>
				{/if}
			</div>
		{/if}

		{#if filtered.length === 0}
			<div class="card text-center text-ink/70">{$t('empty_state')}</div>
		{:else}
			<div class="grid gap-3">
			{#each filtered as book (book.slug)}
				<BookCard {book} on:tag={(event) => (tag = event.detail.tag)} />
			{/each}
			</div>
		{/if}
	</div>
</section>
