<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
	import BookCard from '$lib/components/BookCard.svelte';
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

	type ReadingRange = { min: number; max: number };

	const estimatedReadingHours = (pages: number): ReadingRange => {
		const hours = pages / 30; // lectura aproximada ~30 págs/h
		const min = Math.max(1, Math.round(hours * 0.8));
		const max = Math.max(min, Math.round(hours * 1.2));
		return { min, max };
	};

	let readingRange: ReadingRange | null = null;
	$: readingRange = data.book.pages ? estimatedReadingHours(data.book.pages) : null;
</script>

<section class="space-y-6">
	<nav class="text-xs text-ink/70 flex flex-wrap items-center gap-1">
		<a class="hover:underline" href={base + '/'}>{$t('nav_home')}</a>
		<span>/</span>
		<a class="hover:underline" href={`${base}/books/`}>{$t('books')}</a>
		<span>/</span>
		<span class="text-ink">{titleFor(data.book, $locale)}</span>
	</nav>

	<article class="card space-y-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('book_info')}</p>
					<h1 class="font-display text-4xl text-ink">
						{titleFor(data.book, $locale)}
					</h1>
					<p class="text-ink/80 text-lg">{data.book.author}</p>
				</div>
				<div class="flex flex-col items-start gap-2 md:items-end">
					{#if data.author}
						<a class="badge bg-amber text-ink" href={`${base}/authors/${data.author.slug}/`}>
							{$t('see_author')}
						</a>
					{/if}
					{#if data.book.tags.length}
						<a
							class="badge bg-ink text-white"
							href={`${base}/books/?tag=${encodeURIComponent(data.book.tags[0])}`}
						>
							{$t('read_more')}
						</a>
					{/if}
				</div>
			</div>

		<div class="grid gap-3 md:grid-cols-3">
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('year_range')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.year ?? $t('not_available')}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('language')}</div>
				<div class="text-lg font-semibold text-ink">
					{#if data.book.lang}
						<span class="flag">{flagForLanguage(data.book.lang)}</span>
						&nbsp;{formatLanguageName(data.book.lang, $locale)}
					{:else}
						{$t('not_available')}
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
						{$t('not_available')}
					{/if}
				</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('difficulty')}</div>
				<div class="flex items-end justify-between gap-3">
					<div class="text-lg font-semibold text-ink">{data.book.difficulty ?? $t('not_available')}</div>
					{#if data.book.difficulty}
						<div class="flex h-8 w-20 items-end rounded-full bg-ink/5">
							<div
								class="w-full rounded-full bg-ink"
								style={`height:${(data.book.difficulty / 5) * 100}%`}
							></div>
						</div>
					{/if}
				</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('importance')}</div>
				<div class="flex items-end justify-between gap-3">
					<div class="text-lg font-semibold text-ink">{data.book.importance ?? $t('not_available')}</div>
					{#if data.book.importance}
						<div class="flex h-8 w-20 items-end rounded-full bg-amber/20">
							<div
								class="w-full rounded-full bg-amber"
								style={`height:${(data.book.importance / 5) * 100}%`}
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if data.book.tags.length}
			<div class="flex flex-wrap gap-2">
				{#each data.book.tags as tag}
					<a
						class="badge bg-ink text-white"
						href={`${base}/books/?tag=${encodeURIComponent(tag)}`}
					>
						{tag}
					</a>
				{/each}
			</div>
		{/if}

		<div class="grid gap-3 md:grid-cols-2">
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('format')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.format ?? $t('not_available')}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('genre')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.genre ?? $t('not_available')}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('period')}</div>
				<div class="text-lg font-semibold text-ink">{data.book.period ?? $t('not_available')}</div>
			</div>
			<div class="glass rounded-xl p-4">
				<div class="text-xs uppercase text-ink/60">{$t('pages')}</div>
				<div class="text-lg font-semibold text-ink">
					{#if data.book.pages}
						{data.book.pages}
						{#if readingRange}
							<span class="text-sm text-ink/60">
								· {readingRange.min}–{readingRange.max} h
							</span>
						{/if}
					{:else}
						{$t('not_available')}
					{/if}
				</div>
			</div>
		</div>
	</article>

	{#if data.sameAuthor.length}
		<section class="space-y-3">
			<h2 class="font-display text-2xl text-ink">{$t('authors')}</h2>
			<div class="grid gap-3">
				{#each data.sameAuthor as book (book.slug)}
					<BookCard {book} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.similar.length}
		<section class="space-y-3">
			<h2 class="font-display text-2xl text-ink">{$t('books')}</h2>
			<div class="grid gap-3">
				{#each data.similar as book (book.slug)}
					<BookCard {book} />
				{/each}
			</div>
		</section>
	{/if}
</section>
