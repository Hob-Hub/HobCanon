<svelte:options runes={false} />

<script lang="ts">
	import { t } from '$lib/i18n';
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

	const resetFilters = () => {
		search = '';
		country = '';
		eraFrom = minYear;
		eraTo = maxYear;
	};

	const matchesRange = (value: number | null, from: number, to: number) =>
		value === null || (value >= from && value <= to);

	$: filtered = data.authors.filter((author) => {
		const query = search.trim().toLowerCase();
		const matchesQuery =
			!query ||
			author.name.toLowerCase().includes(query) ||
			(author.alias ?? '').toLowerCase().includes(query);
		const matchesCountry = !country || author.country === country;
		const coreYear = author.birth_year ?? author.death_year;
		const matchesEra = matchesRange(coreYear, eraFrom, eraTo);
		return matchesQuery && matchesCountry && matchesEra;
	});
</script>

<section class="space-y-6">
	<div class="rounded-3xl bg-white/70 p-6 shadow-soft">
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('filters')}</p>
				<h1 class="font-display text-3xl text-ink">{$t('authors')}</h1>
			</div>
			<button
				type="button"
				class="badge bg-ink text-white"
				onclick={resetFilters}
			>
				{$t('reset')}
			</button>
		</div>

		<div class="mt-4 grid gap-4 md:grid-cols-3">
			<label class="flex flex-col gap-2 text-sm">
				<span class="text-ink/70">{$t('search')}</span>
				<input
					class="rounded-xl border border-ink/10 bg-white/80 px-4 py-2"
					type="search"
					placeholder="Name or alias..."
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
		</div>
	</div>

	<p class="text-sm text-ink/70">
		{filtered.length} {$t('results')}
	</p>

	{#if filtered.length === 0}
		<div class="card text-center text-ink/70">{$t('empty_state')}</div>
	{:else}
		<div class="grid gap-4">
			{#each filtered as author (author.slug)}
				<article class="card grid gap-2 md:grid-cols-[1fr,auto] md:items-center">
					<div class="space-y-1">
						<h2 class="font-display text-2xl text-ink">
							<a href={`/authors/${author.slug}/`}>{author.name}</a>
						</h2>
						<p class="text-sm text-ink/70">
							{author.birth_year ?? '—'} {author.death_year ? ` — ${author.death_year}` : ''}
							{author.country ? ` • ${author.country}` : ''}
						</p>
						<p class="text-sm text-ink/60">{author.bookCount} {$t('books')}</p>
					</div>
					<a
						class="badge bg-ink text-white justify-self-end"
						href={`/authors/${author.slug}/`}
						>{$t('see_author')}</a
					>
				</article>
			{/each}
		</div>
	{/if}
</section>
