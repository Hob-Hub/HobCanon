<svelte:options runes={false} />

<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { locale, t, toggleLocale } from '$lib/i18n';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = $locale;
		}
	}
</script>

<svelte:head>
	<title>{$t('brand') ?? 'HobCanon'}</title>
	<meta name="description" content="HobCanon — a compact SPA to explore authors and books." />
</svelte:head>

<div class="min-h-screen">
	<header class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-white/60">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a class="flex items-center gap-3 text-lg font-display tracking-tight" href={base + '/'}>
				<div class="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 to-plum flex items-center justify-center text-ink font-bold shadow-soft">
					H
				</div>
				<div class="leading-tight">
					<div class="font-semibold text-ink">HobCanon</div>
					<div class="text-sm text-ink/70">{$t('tagline')}</div>
				</div>
			</a>
			<nav class="flex items-center gap-5 text-sm font-semibold uppercase tracking-[0.08em]">
				<a class={`pb-1 border-b-2 ${$page.url.pathname === base + '/' ? 'border-ink' : 'border-transparent'}`} href={base + '/'}>{$t('nav_home')}</a>
				<a class={`pb-1 border-b-2 ${$page.url.pathname.startsWith(base + '/books') ? 'border-ink' : 'border-transparent'}`} href={base + '/books/'}>{$t('nav_books')}</a>
				<a class={`pb-1 border-b-2 ${$page.url.pathname.startsWith(base + '/authors') ? 'border-ink' : 'border-transparent'}`} href={base + '/authors/'}>{$t('nav_authors')}</a>
				<button
					type="button"
					class="ml-4 rounded-full border border-ink/20 bg-ink text-white px-4 py-2 text-xs font-semibold shadow-soft hover:-translate-y-[1px] transition"
					onclick={toggleLocale}
					aria-label="Toggle language"
				>
					{$t('cta_language')}
				</button>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 pb-16 pt-10 space-y-10">
		<slot />
	</main>

	<footer class="border-t border-white/60 bg-white/70 backdrop-blur">
		<div class="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-ink/70 md:flex-row md:items-center md:justify-between">
			<div>Built for GitHub Pages — static, fast, and offline-friendly.</div>
			<div class="flex gap-2">
				<span class="badge bg-ink text-white">{$t('books')}: {data?.stats?.totalBooks ?? 0}</span>
				<span class="badge bg-amber text-ink">{$t('authors')}: {data?.stats?.totalAuthors ?? 0}</span>
			</div>
		</div>
	</footer>
</div>
