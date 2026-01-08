<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<svelte:options runes={false} />

<script lang="ts">
import { base } from '$app/paths';
import type { Book } from '$lib/data/types';
import { locale, t, titleFor } from '$lib/i18n';
import type { PageData } from './$types';

	export let data: PageData;

	const highlightedBooks = [...data.books]
		.filter((book) => (book.importance ?? 0) >= 4 || (book.difficulty ?? 0) >= 4)
		.slice(0, 4);

	const spotlightAuthors = [...data.authors]
		.sort((a, b) => b.bookCount - a.bookCount)
		.slice(0, 4);

	const bookSummary = (book: Book) => {
		const parts = [book.genre, book.period, book.lang?.toUpperCase()].filter(Boolean);
		return parts.join(' • ');
	};
</script>

<section class="grid gap-10 rounded-3xl bg-white/70 p-8 shadow-soft md:grid-cols-2 md:items-center">
	<div class="space-y-5">
		<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('brand')}</p>
		<h1 class="font-display text-4xl leading-tight text-ink md:text-5xl">
			{$t('hero_title')}
		</h1>
		<p class="text-lg text-ink/80">{$t('hero_subtitle')}</p>
		<div class="flex flex-wrap gap-2 pt-2">
			<span class="badge bg-ink text-white">{$t('books')}: {data.stats.totalBooks}</span>
			<span class="badge bg-amber text-ink">{$t('authors')}: {data.stats.totalAuthors}</span>
			<span class="badge bg-plum text-white">{$t('top_tags')}</span>
		</div>
	</div>
	<div class="glass rounded-2xl p-6">
		<p class="text-sm text-ink/70">{$t('stats_blurb')}</p>
		<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
			{#each data.stats.topGenres as genre (genre.value)}
				<div class="card p-4">
					<div class="text-xs uppercase text-ink/60">{$t('genre')}</div>
					<div class="text-lg font-semibold text-ink">{genre.value}</div>
					<div class="text-xs text-ink/60">{genre.count} {$t('books')}</div>
				</div>
			{/each}
			{#each data.stats.topTags as tag (tag.value)}
				<div class="card p-4">
					<div class="text-xs uppercase text-ink/60">{$t('tag')}</div>
					<div class="text-lg font-semibold text-ink">{tag.value}</div>
					<div class="text-xs text-ink/60">{tag.count} {$t('books')}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="grid gap-6">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('featured')}</p>
			<h2 class="font-display text-3xl text-ink">{$t('books')}</h2>
		</div>
		<a class="badge bg-ink text-white" href={base + '/books/'}>{$t('see_book')}</a>
	</div>
	<div class="grid gap-6 md:grid-cols-2">
		{#each highlightedBooks as book, index (book.slug)}
			<article class="card relative overflow-hidden">
				<div class="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-plum/5" style={`animation-delay:${index * 80}ms`}></div>
				<div class="relative space-y-2">
					<div class="flex items-center gap-2">
						<span class="badge bg-ink text-white">{book.genre ?? '—'}</span>
						{#if book.importance}
							<span class="badge bg-amber text-ink">★ {book.importance}</span>
						{/if}
						{#if book.difficulty}
							<span class="badge bg-plum text-white">✦ {book.difficulty}</span>
						{/if}
					</div>
					<h3 class="font-display text-2xl text-ink">
						<a href={`${base}/books/${book.slug}/`}>{titleFor(book, $locale)}</a>
					</h3>
					<p class="text-ink/80">{book.author}</p>
					<p class="text-sm text-ink/70">{bookSummary(book)}</p>
					<a
						class="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-amber underline-offset-4"
						href={`${base}/books/${book.slug}/`}
						>{$t('read_more')}</a
					>
				</div>
			</article>
		{/each}
	</div>
</section>

<section class="grid gap-6">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('spotlight')}</p>
			<h2 class="font-display text-3xl text-ink">{$t('authors')}</h2>
		</div>
		<a class="badge bg-ink text-white" href={base + '/authors/'}>{$t('see_author')}</a>
	</div>
	<div class="grid gap-4 md:grid-cols-2">
		{#each spotlightAuthors as author}
			<article class="card flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<h3 class="font-display text-xl text-ink">
						<a href={`${base}/authors/${author.slug}/`}>{author.name}</a>
					</h3>
					<span class="badge bg-amber text-ink">{author.bookCount} {$t('books')}</span>
				</div>
				<p class="text-sm text-ink/70">
					{#if author.birth_year}{author.birth_year}{/if}
					{#if author.death_year} — {author.death_year}{/if}
					{#if author.country} • {author.country}{/if}
				</p>
				<a
					class="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-amber underline-offset-4"
					href={`/authors/${author.slug}/`}
					>{$t('read_more')}</a
				>
			</article>
		{/each}
	</div>
</section>
