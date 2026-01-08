<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import BookCard from '$lib/components/BookCard.svelte';
	import { flagFromCountry, formatCountryName, locale, t } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="space-y-6">
	<a
		class="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-amber underline-offset-4"
		href={`${base}/authors/`}
	>
		← {$t('authors')}
	</a>

	<article class="card space-y-4">
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('author_info')}</p>
				<h1 class="font-display text-4xl text-ink">{data.author.name}</h1>
				{#if data.author.alias}
					<p class="text-sm text-ink/70">Alias: {data.author.alias}</p>
				{/if}
			</div>
			<span class="badge bg-amber text-ink">{data.books.length} {$t('books')}</span>
		</div>

		<div class="grid gap-3 md:grid-cols-3">
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('country')}</div>
				<div class="text-lg font-semibold text-ink">
					{#if data.author.country}
						<span class="flag">{flagFromCountry(data.author.country)}</span>
						&nbsp;{formatCountryName(data.author.country, $locale)}
					{:else}
						N/A
					{/if}
				</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('birth')}</div>
				<div class="text-lg font-semibold text-ink">{data.author.birth_year ?? 'N/A'}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('death')}</div>
				<div class="text-lg font-semibold text-ink">{data.author.death_year ?? 'N/A'}</div>
			</div>
		</div>
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
