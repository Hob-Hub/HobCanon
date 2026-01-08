<svelte:options runes={false} />

<script lang="ts">
import { base } from '$app/paths';
import { locale, t, titleFor } from '$lib/i18n';
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
	};

	const matchesRange = (value: number | null, from: number, to: number) =>
		value === null || (value >= from && value <= to);

	$: filtered = data.books.filter((book) => {
		const query = search.trim().toLowerCase();
		const title = titleFor(book, $locale).toLowerCase();
		const matchesQuery =
			!query ||
			title.includes(query) ||
			book.author.toLowerCase().includes(query) ||
			(book.genre ?? '').toLowerCase().includes(query);

		const matchesCountry = !country || book.country === country;
		const matchesLang = !language || book.lang === language;
		const matchesFormat = !format || book.format === format;
		const matchesGenre = !genre || book.genre === genre;
		const matchesTag = !tag || book.tags.includes(tag);
		const matchesPeriod = !period || book.period === period;
		const matchesDifficulty =
			!difficulty || (book.difficulty ?? 0) >= parseInt(difficulty, 10);
		const matchesImportance =
			!importance || (book.importance ?? 0) >= parseInt(importance, 10);
		const matchesYear = matchesRange(book.year, yearFrom, yearTo);

		return (
			matchesQuery &&
			matchesCountry &&
			matchesLang &&
			matchesFormat &&
			matchesGenre &&
			matchesTag &&
			matchesPeriod &&
			matchesDifficulty &&
			matchesImportance &&
			matchesYear
		);
	});
</script>

<section class="space-y-6">
	<div class="rounded-3xl bg-white/70 p-6 shadow-soft">
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('filters')}</p>
				<h1 class="font-display text-3xl text-ink">{$t('books')}</h1>
			</div>
			<button type="button" class="badge bg-ink text-white" onclick={resetFilters}>
				{$t('reset')}
			</button>
		</div>

		<div class="mt-4 grid gap-4 md:grid-cols-3">
			<label class="flex flex-col gap-2 text-sm">
				<span class="text-ink/70">{$t('search')}</span>
				<input
					class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2"
					type="search"
					placeholder="Title, author, genre..."
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
						<option value={option}>{option}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-2 text-sm">
				<span class="text-ink/70">{$t('language')}</span>
				<select class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2" bind:value={language}>
					<option value="">{'—'}</option>
					{#each data.facets.languages as option}
						<option value={option}>{option.toUpperCase()}</option>
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

	<p class="text-sm text-ink/70">
		{filtered.length} {$t('results')}
	</p>

	{#if filtered.length === 0}
		<div class="card text-center text-ink/70">{$t('empty_state')}</div>
	{:else}
		<div class="grid gap-3">
			{#each filtered as book (book.slug)}
				<article class="card flex flex-col gap-3">
					<div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
						<div>
							<h2 class="font-display text-2xl text-ink">
								<a class="hover:underline decoration-amber underline-offset-4" href={`${base}/books/${book.slug}/`}>
									{titleFor(book, $locale)}
								</a>
							</h2>
							<p class="text-sm text-ink/70 uppercase tracking-[0.12em]">{book.author}</p>
						</div>
						<div class="flex flex-wrap gap-2">
							{#if book.format}
								<span class="badge badge-amber">{book.format}</span>
							{/if}
							{#if book.importance}
								<span class="badge badge-sand">★ {book.importance}</span>
							{/if}
							{#if book.difficulty}
								<span class="badge badge-sand">✦ {book.difficulty}</span>
							{/if}
						</div>
					</div>
					<div class="grid gap-3 text-sm text-ink/80 md:grid-cols-[repeat(5,1fr)_auto] md:items-center">
						<div>
							<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('genre')}</div>
							<div class="font-semibold text-ink">{book.genre ?? '—'}</div>
						</div>
						<div>
							<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('year_range')}</div>
							<div class="font-semibold text-ink">{book.year ?? '—'}</div>
						</div>
						<div>
							<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('language')}</div>
							<div class="font-semibold text-ink">{book.lang?.toUpperCase() ?? '—'}</div>
						</div>
						<div>
							<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('country')}</div>
							<div class="font-semibold text-ink">{book.country ?? '—'}</div>
						</div>
						<div>
							<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('period')}</div>
							<div class="font-semibold text-ink">{book.period ?? '—'}</div>
						</div>
						<a class="badge bg-ink text-white justify-self-start md:justify-self-end" href={`${base}/books/${book.slug}/`}>
							{$t('see_book')}
						</a>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>
