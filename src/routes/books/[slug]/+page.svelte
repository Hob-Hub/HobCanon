<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import { locale, t, titleFor } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;

	const metaItems = [
		{ label: $t('year_range'), value: data.book.year ?? 'N/A' },
		{ label: $t('language'), value: data.book.lang?.toUpperCase() ?? 'N/A' },
		{ label: $t('country'), value: data.book.country ?? 'N/A' },
		{ label: $t('difficulty'), value: data.book.difficulty ?? 'N/A' },
		{ label: $t('importance'), value: data.book.importance ?? 'N/A' }
	];
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
			{#each metaItems as item (item.label)}
				<div class="glass rounded-xl p-4">
					<div class="text-xs uppercase text-ink/60">{item.label}</div>
					<div class="text-lg font-semibold text-ink">{item.value}</div>
				</div>
			{/each}
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
