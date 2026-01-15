<svelte:options runes={false} />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { base } from '$app/paths';
	import type { Book } from '$lib/data/types';
	import {
		flagForLanguage,
		flagFromCountry,
		formatCountryName,
		formatLanguageName,
		locale,
		t,
		titleFor
	} from '$lib/i18n';

	export let book: Book;

	const dispatch = createEventDispatcher<{ tag: { tag: string } }>();

	const summary = () => {
		const parts = [book.genre, book.period, book.lang?.toUpperCase()].filter(Boolean);
		return parts.join(' • ');
	};

	const topTags = () => book.tags.slice(0, 3);
</script>

<article class="card flex flex-col gap-3">
	<div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
		<div>
			<h3 class="font-display text-2xl text-ink">
				<a class="hover:underline decoration-amber underline-offset-4" href={`${base}/books/${book.slug}/`}>
					{titleFor(book, $locale)}
				</a>
			</h3>
			<p class="text-sm text-ink/70 uppercase tracking-[0.12em]">{book.author}</p>
			{#if summary()}
				<p class="text-xs text-ink/60 mt-1">{summary()}</p>
			{/if}
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
			<div class="font-semibold text-ink">
				{#if book.lang}
					<span class="flag">{flagForLanguage(book.lang)}</span>
					&nbsp;{formatLanguageName(book.lang, $locale)}
				{:else}
					—
				{/if}
			</div>
		</div>
		<div>
			<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('country')}</div>
			<div class="font-semibold text-ink">
				{#if book.country}
					<span class="flag">{flagFromCountry(book.country)}</span>
					&nbsp;{formatCountryName(book.country, $locale)}
				{:else}
					—
				{/if}
			</div>
		</div>
		<div>
			<div class="text-[11px] uppercase tracking-[0.14em] text-ink/50">{$t('period')}</div>
			<div class="font-semibold text-ink">{book.period ?? '—'}</div>
		</div>
		<a class="badge bg-ink text-white justify-self-start md:justify-self-end" href={`${base}/books/${book.slug}/`}>
			{$t('see_book')}
		</a>
	</div>
	{#if book.tags.length}
		<div class="flex flex-wrap gap-2 pt-2">
			{#each topTags() as tag}
				<button
					type="button"
					class="badge badge-ink"
					on:click={() => dispatch('tag', { tag })}
				>
					{tag}
				</button>
			{/each}
		</div>
	{/if}
</article>
