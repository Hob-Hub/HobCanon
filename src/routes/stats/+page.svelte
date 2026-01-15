<svelte:options runes={false} />

<script lang="ts">
	import { base } from '$app/paths';
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

	const countByNumeric = (
		items: Book[],
		pick: (book: Book) => string | null | undefined,
		limit = 8
	) => {
		const counts = new Map<string, number>();
		for (const item of items) {
			const key = pick(item);
			if (!key) continue;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		return [...counts.entries()]
			.sort((a, b) => {
				const aNum = Number(a[0]);
				const bNum = Number(b[0]);
				if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
				return a[0].localeCompare(b[0], undefined, { numeric: true });
			})
			.slice(0, limit);
	};

	const byDifficulty = countByNumeric(data.books, (b) => (b.difficulty ? b.difficulty.toString() : null), 5);
	const byImportance = countByNumeric(data.books, (b) => (b.importance ? b.importance.toString() : null), 5);

	const maxValue = (entries: [string, number][]) => Math.max(1, ...entries.map(([, v]) => v));

	const makeTicks = (entries: [string, number][], steps = 3) => {
		const max = maxValue(entries);
		if (steps < 2) return [max];
		const ticks = Array.from({ length: steps }, (_, i) =>
			Math.round((max * i) / (steps - 1))
		);
		return ticks.filter((tick, index) => index === 0 || tick !== ticks[index - 1]);
	};

	const toRoman = (value: number) => {
		if (value <= 0) return '';
		const numerals: [number, string][] = [
			[1000, 'M'],
			[900, 'CM'],
			[500, 'D'],
			[400, 'CD'],
			[100, 'C'],
			[90, 'XC'],
			[50, 'L'],
			[40, 'XL'],
			[10, 'X'],
			[9, 'IX'],
			[5, 'V'],
			[4, 'IV'],
			[1, 'I']
		];
		let remaining = value;
		let result = '';
		for (const [num, roman] of numerals) {
			while (remaining >= num) {
				result += roman;
				remaining -= num;
			}
		}
		return result;
	};

	type ChartPoint = { x: number; y: number; value: number; label: string };
	type ChartTick = { value: number; y: number };

	const buildLineChart = (
		entries: [string, number][],
		options?: {
			width?: number;
			height?: number;
			padding?: { top: number; right: number; bottom: number; left: number };
			ticks?: number;
		}
	) => {
		const width = options?.width ?? 640;
		const height = options?.height ?? 200;
		const padding = options?.padding ?? { top: 12, right: 12, bottom: 32, left: 40 };
		const plotWidth = width - padding.left - padding.right;
		const plotHeight = height - padding.top - padding.bottom;
		const max = maxValue(entries);
		const points: ChartPoint[] = entries.map(([label, value], index) => {
			const x =
				padding.left +
				(entries.length === 1 ? plotWidth / 2 : (index / (entries.length - 1)) * plotWidth);
			const y = padding.top + (1 - value / max) * plotHeight;
			return { x, y, value, label };
		});
		const ticks: ChartTick[] = makeTicks(entries, options?.ticks ?? 4).map((value) => ({
			value,
			y: padding.top + (1 - value / max) * plotHeight
		}));
		return {
			width,
			height,
			padding,
			points,
			ticks,
			polyline: points.map((point) => `${point.x},${point.y}`).join(' ')
		};
	};

	const byCentury = (() => {
		const buckets = new Map<number, number>();
		for (const book of data.books) {
			if (!book.year) continue;
			if (book.year > 1799) continue;
			const year = book.year;
			const century =
				year > 0
					? Math.floor((year - 1) / 100) + 1
					: -1 * (Math.floor((Math.abs(year) - 1) / 100) + 1);
			buckets.set(century, (buckets.get(century) ?? 0) + 1);
		}
		return [...buckets.entries()]
			.sort((a, b) => a[0] - b[0])
			.map(([century, value]) => {
				const roman = toRoman(Math.abs(century));
				const label = century < 0 ? `-${roman}` : roman;
				return [label, value] as [string, number];
			});
	})();

	const byDecade = (() => {
		const buckets = new Map<number, number>();
		for (const book of data.books) {
			if (!book.year) continue;
			if (book.year < 1800 || book.year > 1999) continue;
			const decade = Math.floor(book.year / 10) * 10;
			buckets.set(decade, (buckets.get(decade) ?? 0) + 1);
		}
		const decades: [string, number][] = [];
		for (let decade = 1800; decade <= 1990; decade += 10) {
			decades.push([`${decade}s`, buckets.get(decade) ?? 0]);
		}
		return decades;
	})();

	const centuryChart = buildLineChart(byCentury, {
		width: 640,
		height: 200,
		padding: { top: 12, right: 12, bottom: 32, left: 40 },
		ticks: 4
	});

	const decadeChart = buildLineChart(byDecade, {
		width: 640,
		height: 200,
		padding: { top: 12, right: 12, bottom: 36, left: 40 },
		ticks: 4
	});
</script>

<section class="space-y-8">
	<div class="space-y-2">
		<p class="text-xs uppercase tracking-[0.2em] text-ink/60">{$t('stats')}</p>
		<h1 class="font-display text-3xl text-ink">{$t('stats_overview_title')}</h1>
		<p class="text-sm text-ink/70">{$t('stats_overview_subtitle')}</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('genre')}</h2>
				<span class="text-xs text-ink/60">Top {byGenre.length}</span>
			</div>
			{#each byGenre as [label, value]}
				<a
					class="flex items-center gap-3 group cursor-pointer"
					href={`${base}/books/?genre=${encodeURIComponent(label)}`}
				>
					<div class="w-24 text-sm font-semibold text-ink group-hover:underline">
						{label}
					</div>
					<div class="flex-1 rounded-full bg-ink/5">
						<div
							class="h-2 rounded-full bg-ink group-hover:bg-ink/90"
							style={`width:${(value / maxValue(byGenre)) * 100}%`}
						></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</a>
			{/each}
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('language')}</h2>
				<span class="text-xs text-ink/60">Top {byLanguage.length}</span>
			</div>
			{#each byLanguage as [label, value]}
				<a
					class="flex items-center gap-3 group cursor-pointer"
					href={`${base}/books/?language=${encodeURIComponent(label.toLowerCase())}`}
				>
					<div class="w-16 text-sm font-semibold text-ink group-hover:underline">{label}</div>
					<div class="flex-1 rounded-full bg-amber/20">
						<div
							class="h-2 rounded-full bg-amber group-hover:bg-amber/90"
							style={`width:${(value / maxValue(byLanguage)) * 100}%`}
						></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</a>
			{/each}
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('country')}</h2>
				<span class="text-xs text-ink/60">Top {byCountry.length}</span>
			</div>
			{#each byCountry as [label, value]}
				<a
					class="flex items-center gap-3 group cursor-pointer"
					href={`${base}/books/?country=${encodeURIComponent(label)}`}
				>
					<div class="w-20 text-sm font-semibold text-ink group-hover:underline">{label}</div>
					<div class="flex-1 rounded-full bg-plum/15">
						<div
							class="h-2 rounded-full bg-plum group-hover:bg-plum/90"
							style={`width:${(value / maxValue(byCountry)) * 100}%`}
						></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</a>
			{/each}
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('format')}</h2>
				<span class="text-xs text-ink/60">Top {byFormat.length}</span>
			</div>
			{#each byFormat as [label, value]}
				<a
					class="flex items-center gap-3 group cursor-pointer"
					href={`${base}/books/?format=${encodeURIComponent(label)}`}
				>
					<div class="w-20 text-sm font-semibold text-ink group-hover:underline">{label}</div>
					<div class="flex-1 rounded-full bg-ink/10">
						<div
							class="h-2 rounded-full bg-ink group-hover:bg-ink/90"
							style={`width:${(value / maxValue(byFormat)) * 100}%`}
						></div>
					</div>
					<div class="w-8 text-right text-sm text-ink/70">{value}</div>
				</a>
			{/each}
		</div>
	</div>

	<div class="space-y-6">
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('timeline_century')}</h2>
				<span class="text-xs text-ink/60">{$t('timeline_century_hint')}</span>
			</div>
			<div class="w-full">
				<svg
					viewBox={`0 0 ${centuryChart.width} ${centuryChart.height}`}
					class="w-full aspect-[16/5]"
				>
					{#each centuryChart.ticks as tick}
						<line
							x1={centuryChart.padding.left}
							y1={tick.y}
							x2={centuryChart.width - centuryChart.padding.right}
							y2={tick.y}
							class="stroke-ink/10"
						/>
						<line
							x1={centuryChart.padding.left - 4}
							y1={tick.y}
							x2={centuryChart.padding.left}
							y2={tick.y}
							class="stroke-ink/30"
						/>
						<text
							x={centuryChart.padding.left - 6}
							y={tick.y + 3}
							font-size="10"
							text-anchor="end"
							class="fill-ink/50"
						>
							{tick.value}
						</text>
					{/each}
					<line
						x1={centuryChart.padding.left}
						y1={centuryChart.padding.top}
						x2={centuryChart.padding.left}
						y2={centuryChart.height - centuryChart.padding.bottom}
						class="stroke-ink/30"
					/>
					<line
						x1={centuryChart.padding.left}
						y1={centuryChart.height - centuryChart.padding.bottom}
						x2={centuryChart.width - centuryChart.padding.right}
						y2={centuryChart.height - centuryChart.padding.bottom}
						class="stroke-ink/30"
					/>
					<text
						x={centuryChart.padding.left}
						y={centuryChart.padding.top - 2}
						font-size="9"
						text-anchor="start"
						class="fill-ink/50"
					>
						{$t('chart_count')}
					</text>
					<text
						x={(centuryChart.padding.left + centuryChart.width - centuryChart.padding.right) / 2}
						y={centuryChart.height - 4}
						font-size="9"
						text-anchor="middle"
						class="fill-ink/50"
					>
						{$t('chart_period')}
					</text>
					<polyline
						points={centuryChart.polyline}
						fill="none"
						class="stroke-amber"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					{#each centuryChart.points as point}
						<circle cx={point.x} cy={point.y} r="3" class="fill-amber" />
					{/each}
					{#each centuryChart.points as point, index}
						<text
							x={point.x}
							y={centuryChart.height - centuryChart.padding.bottom + 12}
							font-size="9"
							text-anchor={
								index === 0
									? 'start'
									: index === centuryChart.points.length - 1
										? 'end'
										: 'middle'
							}
							class="fill-ink/60"
						>
							{point.label}
						</text>
					{/each}
				</svg>
			</div>
		</div>

		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('timeline_decade')}</h2>
				<span class="text-xs text-ink/60">{$t('timeline_decade_hint')}</span>
			</div>
			<div class="w-full">
				<svg
					viewBox={`0 0 ${decadeChart.width} ${decadeChart.height}`}
					class="w-full aspect-[16/5]"
				>
					{#each decadeChart.ticks as tick}
						<line
							x1={decadeChart.padding.left}
							y1={tick.y}
							x2={decadeChart.width - decadeChart.padding.right}
							y2={tick.y}
							class="stroke-ink/10"
						/>
						<line
							x1={decadeChart.padding.left - 4}
							y1={tick.y}
							x2={decadeChart.padding.left}
							y2={tick.y}
							class="stroke-ink/30"
						/>
						<text
							x={decadeChart.padding.left - 6}
							y={tick.y + 3}
							font-size="10"
							text-anchor="end"
							class="fill-ink/50"
						>
							{tick.value}
						</text>
					{/each}
					<line
						x1={decadeChart.padding.left}
						y1={decadeChart.padding.top}
						x2={decadeChart.padding.left}
						y2={decadeChart.height - decadeChart.padding.bottom}
						class="stroke-ink/30"
					/>
					<line
						x1={decadeChart.padding.left}
						y1={decadeChart.height - decadeChart.padding.bottom}
						x2={decadeChart.width - decadeChart.padding.right}
						y2={decadeChart.height - decadeChart.padding.bottom}
						class="stroke-ink/30"
					/>
					<text
						x={decadeChart.padding.left}
						y={decadeChart.padding.top - 2}
						font-size="9"
						text-anchor="start"
						class="fill-ink/50"
					>
						{$t('chart_count')}
					</text>
					<text
						x={(decadeChart.padding.left + decadeChart.width - decadeChart.padding.right) / 2}
						y={decadeChart.height - 4}
						font-size="9"
						text-anchor="middle"
						class="fill-ink/50"
					>
						{$t('chart_period')}
					</text>
					<polyline
						points={decadeChart.polyline}
						fill="none"
						class="stroke-amber"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					{#each decadeChart.points as point}
						<circle cx={point.x} cy={point.y} r="3" class="fill-amber" />
					{/each}
					{#each decadeChart.points as point, index}
						<text
							x={point.x}
							y={decadeChart.height - decadeChart.padding.bottom + 12}
							font-size="8"
							text-anchor={
								index === 0
									? 'start'
									: index === decadeChart.points.length - 1
										? 'end'
										: 'middle'
							}
							class="fill-ink/60"
						>
							{point.label}
						</text>
					{/each}
				</svg>
			</div>
		</div>
	</div>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('difficulty_label')}</h2>
				<span class="text-xs text-ink/60">1-5</span>
			</div>
			<div class="flex items-end justify-between gap-4">
				{#each byDifficulty as [label, value]}
					<div class="flex flex-1 flex-col items-center gap-2">
						<div class="text-xs text-ink/70">{value}</div>
						<div class="flex h-28 w-10 items-end rounded-full bg-ink/5">
							<div
								class="w-full rounded-full bg-ink"
								style={`height:${(value / maxValue(byDifficulty)) * 100}%`}
							></div>
						</div>
						<div class="text-sm font-semibold text-ink">{label}</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="card space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm uppercase tracking-[0.12em] text-ink/60">{$t('importance_label')}</h2>
				<span class="text-xs text-ink/60">1-5</span>
			</div>
			<div class="flex items-end justify-between gap-4">
				{#each byImportance as [label, value]}
					<div class="flex flex-1 flex-col items-center gap-2">
						<div class="text-xs text-ink/70">{value}</div>
						<div class="flex h-28 w-10 items-end rounded-full bg-plum/15">
							<div
								class="w-full rounded-full bg-plum"
								style={`height:${(value / maxValue(byImportance)) * 100}%`}
							></div>
						</div>
						<div class="text-sm font-semibold text-ink">{label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
