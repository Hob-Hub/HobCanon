<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import {
		flagForLanguage,
		flagFromCountry,
		formatCountryName,
		formatLanguageName,
		locale,
		t,
		titleFor
	} from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="space-y-6">
	<a
		class="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-amber underline-offset-4"
		href={`${base}/books/`}
	>
		← {$t('books')}
	</a>

	<article class="card space-y-4">
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('book_info')}</p>
				<h1 class="font-display text-4xl text-ink">
					{titleFor(data.book, $locale)}
				</h1>
				<p class="text-ink/80 text-lg">{data.book.author}</p>
			</div>
			{#if data.author}
				<a class="badge bg-amber text-ink" href={`${base}/authors/${data.author.slug}/`}>
					{$t('see_author')}
				</a>
			{/if}
		</div>

		<div class="grid gap-3 md:grid-cols-3">
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('year_range')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.year ?? 'N/A'}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('language')}</div>
				<div class="text-lg font-semibold text-ink">
					{#if data.book.lang}
						<span class="flag">{flagForLanguage(data.book.lang)}</span>
						&nbsp;{formatLanguageName(data.book.lang, $locale)}
					{:else}
						N/A
					{/if}
				</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('country')}</div>
				<div class="text-lg font-semibold text-ink">
					{#if data.book.country}
						<span class="flag">{flagFromCountry(data.book.country)}</span>
						&nbsp;{formatCountryName(data.book.country, $locale)}
					{:else}
						N/A
					{/if}
				</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('difficulty')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.difficulty ?? 'N/A'}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('importance')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.importance ?? 'N/A'}</div>
			</div>
		</div>

		{#if data.book.tags.length}
			<div class="flex flex-wrap gap-2">
				{#each data.book.tags as tag}
					<span class="badge bg-ink text-white">{tag}</span>
				{/each}
			</div>
		{/if}

		<div class="grid gap-3 md:grid-cols-2">
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('format')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.format ?? 'N/A'}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('genre')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.genre ?? 'N/A'}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('period')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.period ?? 'N/A'}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">Pages</div>
				<div class="text-lg font-semibold text-ink">{data.book.pages ?? 'N/A'}</div>
			</div>
		</div>
	</article>
</section>
