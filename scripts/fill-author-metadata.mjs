import fs from 'node:fs/promises';

const AUTHORS_PATH = 'src/lib/data/authors.json';
const CONCURRENCY = 4;
const REQUEST_DELAY_MS = 120;
const USER_AGENT = 'HobCanonMetadataScript/1.0 (local)';
const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search/authors.json';
const OPEN_LIBRARY_AUTHOR = 'https://openlibrary.org/authors';
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

const SKIP_NAME_PATTERNS = [/^anonim/, /^anonyme$/, /^anonymous$/];

const STOPWORDS = new Set([
	'de',
	'del',
	'la',
	'las',
	'los',
	'el',
	'von',
	'van',
	'der',
	'den',
	'da',
	'di',
	'du',
	'des',
	'le',
	'st',
	'saint',
	'san',
	'santa',
	'the',
	'of',
	'y',
	'and',
	'do',
	'dos',
	'das'
]);

const PREFIXES = `PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX schema: <http://schema.org/>`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, attempt = 0, headers = {}) => {
	if (REQUEST_DELAY_MS > 0) {
		await sleep(REQUEST_DELAY_MS);
	}
	const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, ...headers } });
	if (response.ok) {
		return response.json();
	}
	const text = await response.text();
	if ((response.status === 429 || response.status >= 500) && attempt < 5) {
		const retryAfter = response.headers.get('retry-after');
		const waitMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 500 * (attempt + 1);
		await sleep(Number.isFinite(waitMs) ? waitMs : 1000);
		return fetchJson(url, attempt + 1, headers);
	}
	throw new Error(`Request failed (${response.status}): ${text.slice(0, 200)}`);
};

const normalizeName = (value) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();

const tokenize = (value) =>
	normalizeName(value)
		.split(' ')
		.filter((token) => token && !STOPWORDS.has(token));

const tokenSetScore = (a, b) => {
	const tokensA = tokenize(a);
	const tokensB = tokenize(b);
	if (tokensA.length === 0 || tokensB.length === 0) return 0;
	const setA = new Set(tokensA);
	const setB = new Set(tokensB);
	let intersection = 0;
	for (const token of setA) {
		if (setB.has(token)) intersection += 1;
	}
	return intersection / Math.max(setA.size, setB.size);
};

const levenshtein = (a, b) => {
	if (a === b) return 0;
	if (!a) return b.length;
	if (!b) return a.length;
	const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
	for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
	for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
	for (let i = 1; i <= a.length; i += 1) {
		for (let j = 1; j <= b.length; j += 1) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
		}
	}
	return dp[a.length][b.length];
};

const charScore = (a, b) => {
	const cleanA = normalizeName(a).replace(/ /g, '');
	const cleanB = normalizeName(b).replace(/ /g, '');
	if (!cleanA || !cleanB) return 0;
	const distance = levenshtein(cleanA, cleanB);
	return 1 - distance / Math.max(cleanA.length, cleanB.length);
};

const scoreName = (candidate, target) =>
	Math.max(tokenSetScore(candidate, target), charScore(candidate, target));

const parseYearFromText = (value) => {
	if (!value || typeof value !== 'string') return null;
	const matches = value.match(/-?\d{3,4}/g);
	if (!matches || matches.length === 0) return null;
	return Number.parseInt(matches[matches.length - 1], 10);
};

const normalizeUrl = (value) => {
	if (!value) return null;
	return value.replace(/^http:\/\//, 'https://');
};

const buildCandidates = (author) => {
	const candidates = [];
	if (author.name) candidates.push(author.name);
	if (author.name?.includes(',')) {
		const [last, rest] = author.name.split(',', 2);
		const reordered = `${rest ?? ''} ${last ?? ''}`.trim();
		if (reordered) candidates.unshift(reordered);
	}
	if (author.alias) candidates.push(author.alias);
	return [...new Set(candidates.map((value) => value.trim()).filter(Boolean))];
};

const chooseOpenLibraryMatch = (author, candidate, docs) => {
	let best = null;
	for (const doc of docs) {
		const nameScore = scoreName(candidate, doc.name ?? '');
		let altScore = 0;
		if (Array.isArray(doc.alternate_names)) {
			for (const alt of doc.alternate_names.slice(0, 8)) {
				altScore = Math.max(altScore, scoreName(candidate, alt));
			}
		}
		const score = Math.max(nameScore, altScore);
		const strongName = score >= 0.9;
		const veryStrongName = score >= 0.97;
		if (!strongName) continue;

		const birth = parseYearFromText(doc.birth_date);
		const death = parseYearFromText(doc.death_date);
		const birthOk =
			author.birth_year == null || (birth != null ? author.birth_year === birth : veryStrongName);
		const deathOk =
			author.death_year == null || (death != null ? author.death_year === death : veryStrongName);
		if (!birthOk || !deathOk) continue;

		if (!best || score > best.score) {
			best = {
				score,
				key: doc.key,
				name: doc.name
			};
		}
	}
	return best;
};

const fetchOpenLibraryMatch = async (author) => {
	const candidates = buildCandidates(author);
	for (const candidate of candidates) {
		const searchUrl = `${OPEN_LIBRARY_SEARCH}?q=${encodeURIComponent(candidate)}`;
		const search = await fetchJson(searchUrl);
		const docs = Array.isArray(search?.docs) ? search.docs.slice(0, 10) : [];
		const match = chooseOpenLibraryMatch(author, candidate, docs);
		if (match) return match;
	}
	return null;
};

const fetchOpenLibraryAuthor = async (key) => {
	const url = `${OPEN_LIBRARY_AUTHOR}/${encodeURIComponent(key)}.json`;
	return fetchJson(url);
};

const fetchWikidataBatch = async (ids) => {
	const values = ids.map((id) => `wd:${id}`).join(' ');
	const query = `${PREFIXES}
SELECT ?item ?enwiki ?image WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?enwiki schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>. }
  OPTIONAL { ?item wdt:P18 ?image. }
}`;
	const url = `${SPARQL_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;
	const data = await fetchJson(url, 0, { Accept: 'application/sparql-results+json' });
	const bindings = data?.results?.bindings ?? [];
	const map = new Map();
	for (const binding of bindings) {
		const item = binding.item?.value ?? '';
		const id = item.split('/').pop();
		if (!id) continue;
		map.set(id, {
			enwiki: normalizeUrl(binding.enwiki?.value ?? null),
			image: normalizeUrl(binding.image?.value ?? null)
		});
	}
	return map;
};

const run = async () => {
	const raw = await fs.readFile(AUTHORS_PATH, 'utf8');
	const authors = JSON.parse(raw);
	const updated = new Array(authors.length);
	const qidByIndex = new Map();
	let processed = 0;
	let openLibraryMatches = 0;

	let index = 0;
	const workers = Array.from({ length: CONCURRENCY }, async () => {
		while (true) {
			const current = index;
			index += 1;
			if (current >= authors.length) break;
			const author = authors[current];
			updated[current] = author;

			const normalized = normalizeName(author.name ?? '');
			if (SKIP_NAME_PATTERNS.some((pattern) => pattern.test(normalized))) {
				processed += 1;
				continue;
			}

			if (!author.url_wikipedia || !author.url_photo) {
				try {
					const match = await fetchOpenLibraryMatch(author);
					if (match?.key) {
						const olAuthor = await fetchOpenLibraryAuthor(match.key);
						const qid = olAuthor?.remote_ids?.wikidata ?? null;
						if (qid) {
							qidByIndex.set(current, qid);
						}
						const wikipedia = olAuthor?.wikipedia;
						if (
							wikipedia &&
							!author.url_wikipedia &&
							/\/\/en\.wikipedia\.org\//i.test(wikipedia)
						) {
							updated[current] = { ...updated[current], url_wikipedia: normalizeUrl(wikipedia) };
						}
						openLibraryMatches += 1;
					}
				} catch (error) {
					console.warn(`OpenLibrary lookup failed for "${author.name}": ${error.message}`);
				}
			}

			processed += 1;
			if (processed % 25 === 0) {
				console.log(`Processed ${processed}/${authors.length}...`);
			}
		}
	});

	await Promise.all(workers);

	const uniqueQids = [...new Set([...qidByIndex.values()])];
	const batches = [];
	for (let i = 0; i < uniqueQids.length; i += 50) {
		batches.push(uniqueQids.slice(i, i + 50));
	}

	const wikidataMap = new Map();
	for (const batch of batches) {
		try {
			const batchMap = await fetchWikidataBatch(batch);
			for (const [key, value] of batchMap.entries()) {
				wikidataMap.set(key, value);
			}
		} catch (error) {
			console.warn(`Wikidata batch failed: ${error.message}`);
		}
	}

	for (const [authorIndex, qid] of qidByIndex.entries()) {
		const author = updated[authorIndex];
		const resolved = wikidataMap.get(qid);
		if (!resolved) continue;
		updated[authorIndex] = {
			...author,
			url_wikipedia: author.url_wikipedia ?? resolved.enwiki ?? null,
			url_photo: author.url_photo ?? resolved.image ?? null
		};
	}

	await fs.writeFile(AUTHORS_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
	console.log(`OpenLibrary matches: ${openLibraryMatches}`);
	console.log(`Wikidata QIDs resolved: ${wikidataMap.size}`);
};

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
