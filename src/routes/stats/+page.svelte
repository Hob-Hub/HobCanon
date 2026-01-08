<svelte:options runes={false} />

<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Book } from '$lib/data/types';
	import type { PageData } from './$types';

	export let data: PageData;

	const countBy = (items: Book[], pick: (book: Book) => string | null | undefined, limit = 8) => {
		const counts = new Map<string, number>();
		for (const item of items) {
			const key = pick(item);
			if (!key) continue;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit);
	};

	const byGenre = countBy(data.books, (b) => b.genre);
	const byLanguage = countBy(data.books, (b) => b.lang?.toUpperCase());
	const byCountry = countBy(data.books, (b) => b.country);
	const byFormat = countBy(data.books, (b) => b.format ?? undefined);

	const byDifficulty = countBy(data.books, (b) => (b.difficulty ? b.difficulty.toString() : null), 5);
	const byImportance = countBy(data.books, (b) => (b.importance ? b.importance.toString() : null), 5);

	const byCentury = (() => {
		const buckets = new Map<string, number>();
		for (const book of data.books) {
			if (!book.year) continue;
			const century = Math.floor((book.year - 1) / 100) + 1;
			const label = century > 0 ? `${century}°` : `${Math.abs(century)}° BCE`;
			buckets.set(label, (buckets.get(label) ?? 0) + 1);
		}
		return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
	})();

	const maxValue = (entries: [string, number][]) => Math.max(1, ...entries.map(([, v]) => v));
</script>

<section class="space-y-8">
	<div class="space-y-2">
		<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('stats')}</p>
		<h1 class="font-display text-3xl text-ink">Books overview</h1>
		<p class="text-sm text-ink/70">Snapshots using the current static dataset.</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('genre')}</h2>
				<span class="text-xs text-ink/60">Top {byGenre.length}</span>
			</div>
			{#each byGenre as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-24 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-ink/5">
						<div class="h-2 rounded-full bg-ink" style={`width:${(value / maxValue(byGenre)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('language')}</h2>
				<span class="text-xs text-ink/60">Top {byLanguage.length}</span>
			</div>
			{#each byLanguage as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-16 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-amber/20">
						<div class="h-2 rounded-full bg-amber" style={`width:${(value / maxValue(byLanguage)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('country')}</h2>
				<span class="text-xs text-ink/60">Top {byCountry.length}</span>
			</div>
			{#each byCountry as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-20 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-plum/15">
						<div class="h-2 rounded-full bg-plum" style={`width:${(value / maxValue(byCountry)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('format')}</h2>
				<span class="text-xs text-ink/60">Top {byFormat.length}</span>
			</div>
			{#each byFormat as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-20 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-ink/10">
						<div class="h-2 rounded-full bg-ink" style={`width:${(value / maxValue(byFormat)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="card space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">Timeline by century</h2>
			<span class="text-xs text-ink/60">{byCentury.length} buckets</span>
		</div>
		<div class="grid gap-2 md:grid-cols-2">
			{#each byCentury as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-24 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-amber/15">
						<div class="h-2 rounded-full bg-amber" style={`width:${(value / maxValue(byCentury)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">Difficulty</h2>
				<span class="text-xs text-ink/60">1–5</span>
			</div>
			{#each byDifficulty as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-10 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-ink/5">
						<div class="h-2 rounded-full bg-ink" style={`width:${(value / maxValue(byDifficulty)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">Importance</h2>
				<span class="text-xs text-ink/60">1–5</span>
			</div>
			{#each byImportance as [label, value]}
				<div class="flex items-center gap-3">
					<div class="w-10 text-sm font-semibold text-ink">{label}</div>
					<div class="flex-1 rounded-full bg-plum/15">
						<div class="h-2 rounded-full bg-plum" style={`width:${(value / maxValue(byImportance)) * 100}%`}></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
