<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import BookCard from '$lib/components/BookCard.svelte';
	import { flagFromCountry, formatCountryName, locale, t } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;

	type AuthorProfile = {
		genres: string[];
		periods: string[];
	};

	const buildAuthorProfile = (): AuthorProfile => {
		const genreCounts = new Map<string, number>();
		const periodCounts = new Map<string, number>();

		for (const book of data.books) {
			if (book.genre) {
				genreCounts.set(book.genre, (genreCounts.get(book.genre) ?? 0) + 1);
			}
			if (book.period) {
				periodCounts.set(book.period, (periodCounts.get(book.period) ?? 0) + 1);
			}
		}

		const topGenres = [...genreCounts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([genre]) => genre);

		const topPeriods = [...periodCounts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([period]) => period);

		return { genres: topGenres, periods: topPeriods };
	};

	const profile = buildAuthorProfile();
</script>

<section class="space-y-6">
	<a
		class="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-amber underline-offset-4"
		href={`${base}/authors/`}
	>
		← {$t('authors')}
	</a>

	<article class="card space-y-4">
		<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="space-y-2">
				<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('author_info')}</p>
				<h1 class="font-display text-4xl text-ink">{data.author.name}</h1>
				{#if data.author.alias}
					<p class="text-sm text-ink/70">Alias: {data.author.alias}</p>
				{/if}
				{#if data.author.url_wikipedia}
					<a
						class="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-amber underline-offset-4"
						href={data.author.url_wikipedia}
						target="_blank"
						rel="noreferrer noopener"
					>
						{$t('wikipedia')}
					</a>
				{/if}
			</div>
			<div class="flex flex-col items-start gap-3 md:items-end">
				<span class="badge bg-amber text-ink">{data.books.length} {$t('books')}</span>
				<a
					class="badge bg-ink text-white"
					href={`${base}/books/?author=${data.author.slug}`}
				>
					{$t('books')}
				</a>
				{#if data.author.url_photo}
					<a
						class="block"
						href={data.author.url_wikipedia ?? data.author.url_photo}
						target="_blank"
						rel="noreferrer noopener"
					>
						<img
							class="h-40 w-32 rounded-2xl object-cover shadow-soft"
							src={data.author.url_photo}
							alt={`${$t('photo')}: ${data.author.name}`}
							loading="lazy"
						/>
					</a>
				{/if}
			</div>
		</div>

			<div class="grid gap-3 md:grid-cols-3">
				<div class="glass rounded-xl p-4">
					<div class="text-xs uppercase text-ink/60">{$t('country')}</div>
					<div class="text-lg font-semibold text-ink">
						{#if data.author.country}
							<span class="flag">{flagFromCountry(data.author.country)}</span>
							&nbsp;{formatCountryName(data.author.country, $locale)}
						{:else}
							{$t('not_available')}
						{/if}
					</div>
				</div>
				<div class="glass rounded-xl p-4">
					<div class="text-xs uppercase text-ink/60">{$t('birth')}</div>
					<div class="text-lg font-semibold text-ink">{data.author.birth_year ?? $t('not_available')}</div>
				</div>
				<div class="glass rounded-xl p-4">
					<div class="text-xs uppercase text-ink/60">{$t('death')}</div>
					<div class="text-lg font-semibold text-ink">{data.author.death_year ?? $t('not_available')}</div>
				</div>
			</div>

			{#if profile.genres.length || profile.periods.length}
				<div class="mt-4 grid gap-3 md:grid-cols-2">
					{#if profile.genres.length}
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="text-ink/60 uppercase tracking-[0.12em]">{$t('genre')}</span>
							{#each profile.genres as genre}
								<span class="badge bg-sand text-ink">{genre}</span>
							{/each}
						</div>
					{/if}
					{#if profile.periods.length}
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="text-ink/60 uppercase tracking-[0.12em]">{$t('period')}</span>
							{#each profile.periods as period}
								<span class="badge bg-amber/30 text-ink">{period}</span>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</article>

	<section class="space-y-3">
		<h2 class="font-display text-2xl text-ink">{$t('books')}</h2>
		{#if data.books.length === 0}
			<div class="card text-ink/70">{$t('empty_state')}</div>
		{:else}
			<div class="grid gap-3">
				{#each data.books as book (book.slug)}
					<BookCard {book} />
				{/each}
			</div>
		{/if}
	</section>
</section>
