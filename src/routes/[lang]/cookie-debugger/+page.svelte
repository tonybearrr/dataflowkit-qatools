<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { tStringReactive, type Locale } from '$lib/i18n';
	import {
		parseCookies,
		detectCookieIssues,
		detectDomainMismatch,
		deriveContextFromUrls,
		type ParsedCookie,
		type CookieContext,
		type ParsedCookiesResult
	} from '$lib/tools/cookies';
	import {
		exampleSameSiteNoneNoSecure,
		exampleCrossSiteBlocked,
		exampleValidSession,
		exampleDomainMismatch,
		exampleMultipleCookies,
		exampleCookieHeader
	} from '$lib/tools/cookies/examples';
	import CookieCard from '$lib/tools/cookies/components/CookieCard.svelte';
	import CookieDetails from '$lib/tools/cookies/components/CookieDetails.svelte';
	import IssuesPanel from '$lib/tools/cookies/components/IssuesPanel.svelte';
	import ContextSimulator from '$lib/tools/cookies/components/ContextSimulator.svelte';
	import { Cookie, RefreshCw, Play, LoaderCircle } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);

	let rawCookies = $state('');
	let mode = $state<'set-cookie' | 'cookie'>('set-cookie');
	let autoParse = $state(false);
	let parsedResult = $state<ParsedCookiesResult | null>(null);
	let selectedCookie = $state<ParsedCookie | null>(null);
	let isParsing = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let highlightedCookieRow: string | null = $state(null);
	let cookieContext = $state<CookieContext | null>(
		deriveContextFromUrls('https://app.example.com', 'https://api.example.com/v1/me', 'GET', false, false)
	);
	let showOnlyIssues = $state(false);

	const allIssues = $derived.by(() => {
		if (!parsedResult) return [];
		const issues = detectCookieIssues(parsedResult.cookies);
		
		if (cookieContext) {
			for (const cookie of parsedResult.cookies) {
				const mismatch = detectDomainMismatch(cookie, cookieContext.siteUrl);
				if (mismatch) {
					issues.push(mismatch);
				}
			}
		}

		return issues;
	});

	const filteredCookies = $derived.by(() => {
		if (!parsedResult) return [];
		if (!showOnlyIssues) {
			return parsedResult.cookies;
		}
		const issueCookieNames = new Set(allIssues.map(i => i.relatedCookieName).filter(Boolean));
		const filtered = parsedResult.cookies.filter(c => issueCookieNames.has(c.name));

		return filtered;
	});

	function parse() {
		if (isParsing) return;
		if (!rawCookies.trim()) {
			parsedResult = null;
			selectedCookie = null;
			return;
		}

		isParsing = true;
		setTimeout(() => {
			try {
				const result = parseCookies(rawCookies, mode);
				parsedResult = result;
			} catch (error) {
				console.error('Parse error:', error);
				parsedResult = null;
			} finally {
				isParsing = false;
			}
		}, 0);
	}

	function handleAutoParse() {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (!autoParse) return;

		debounceTimer = setTimeout(() => {
			parse();
		}, 400);
	}

	$effect(() => {
		if (autoParse && rawCookies) {
			handleAutoParse();
		}
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	function reset() {
		rawCookies = '';
		parsedResult = null;
		selectedCookie = null;
		mode = 'set-cookie';
		autoParse = false;
	}

	function loadExample(example: string) {
		rawCookies = example;
		parse();
	}

	function handleCookieSelect(cookie: ParsedCookie) {
		selectedCookie = cookie;
	}

	function handleSelectCookieFromIssue(cookieName: string) {
		if (!parsedResult) return;

		const cookie = parsedResult.cookies.find((c) => c.name === cookieName);
		if (!cookie) return;

		selectedCookie = cookie;

		requestAnimationFrame(() => {
			const element = document.querySelector(
				`[data-cookie-row="${cookieName}"]`
			) as HTMLElement;
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });

				highlightedCookieRow = cookieName;
				element.classList.add('cookie-pulse');
				setTimeout(() => {
					element.classList.remove('cookie-pulse');
					highlightedCookieRow = null;
				}, 1200);
			}
		});
	}

	function handleContextChange(context: CookieContext) {
		cookieContext = context;
	}

	onMount(() => {
		const saved = localStorage.getItem('cookie-debugger-state');
		if (saved) {
			try {
				const state = JSON.parse(saved);
				rawCookies = state.rawCookies || '';
				mode = state.mode || 'set-cookie';
				autoParse = state.autoParse || false;
				if (rawCookies && autoParse) {
					parse();
				}
			} catch {
				// Ignore
			}
		}
	});

	$effect(() => {
		if (rawCookies || mode !== 'set-cookie' || autoParse !== false) {
			localStorage.setItem(
				'cookie-debugger-state',
				JSON.stringify({
					rawCookies,
					mode,
					autoParse
				})
			);
		}
	});
</script>

<svelte:head>
	<style>
		@keyframes cookie-pulse {
			0%,
			100% {
				box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
			}
			50% {
				box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
			}
		}

		[data-cookie-row].cookie-pulse {
			animation: cookie-pulse 1.2s ease-in-out !important;
			border-color: var(--color-accent) !important;
		}
	</style>
	<title>{tStringReactive('cookieDebugger.title', lang)}</title>
	<meta name="description" content={tStringReactive('cookieDebugger.description', lang)} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
	<!-- Header -->
	<header class="mb-6 sm:mb-8">
		<div class="flex gap-3 mb-4">
			<div class="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
				<Cookie class="w-6 h-6 text-orange-400" />
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold mb-3">
					{tStringReactive('cookieDebugger.heading', lang)}
				</h1>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
					{tStringReactive('cookieDebugger.subtitle', lang)}
				</p>
			</div>
		</div>
	</header>

	<div class="space-y-6">
		<!-- Input section -->
		<div class="space-y-4">
			<!-- Mode toggle -->
			<div class="flex items-center gap-4">
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						bind:group={mode}
						value="set-cookie"
						onchange={() => {
							if (autoParse && rawCookies) parse();
						}}
						class="w-4 h-4"
					/>
					<span class="text-sm">{tStringReactive('cookieDebugger.modeSetCookie', lang)}</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						bind:group={mode}
						value="cookie"
						onchange={() => {
							if (autoParse && rawCookies) parse();
						}}
						class="w-4 h-4"
					/>
					<span class="text-sm">{tStringReactive('cookieDebugger.modeCookie', lang)}</span>
				</label>
			</div>

			<!-- Input textarea -->
			<div>
				<label for="cookies-input" class="block text-sm font-semibold mb-2">
					{tStringReactive('cookieDebugger.inputLabel', lang)}
				</label>
				<textarea
					id="cookies-input"
					bind:value={rawCookies}
					oninput={() => {
						if (autoParse) handleAutoParse();
					}}
					placeholder={tStringReactive('cookieDebugger.placeholder', lang)}
					class="w-full h-48 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
					spellcheck="false"
				></textarea>
			</div>

			<!-- Controls row -->
			<div class="flex flex-wrap items-center gap-3">
				<!-- Auto-parse toggle -->
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={autoParse}
						class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
					/>
					<span class="text-sm text-[var(--color-text-muted)]">
						{tStringReactive('cookieDebugger.autoParse', lang)}
					</span>
				</label>

				<div class="flex-1"></div>

				<!-- Buttons -->
				<button
					onclick={parse}
					disabled={isParsing}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{#if isParsing}
						<LoaderCircle class="w-4 h-4 animate-spin" />
					{:else}
						<Play class="w-4 h-4" />
					{/if}
					{tStringReactive('cookieDebugger.parse', lang)}
				</button>

				<button
					onclick={reset}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2"
				>
					<RefreshCw class="w-4 h-4" />
					{tStringReactive('cookieDebugger.reset', lang)}
				</button>

				<!-- Example dropdown -->
				<select
					value=""
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						const value = target.value;
						if (value === 'samesite-none') {
							loadExample(exampleSameSiteNoneNoSecure);
						} else if (value === 'cross-site') {
							loadExample(exampleCrossSiteBlocked);
						} else if (value === 'valid-session') {
							loadExample(exampleValidSession);
						} else if (value === 'domain-mismatch') {
							loadExample(exampleDomainMismatch);
						} else if (value === 'multiple') {
							loadExample(exampleMultipleCookies);
						} else if (value === 'cookie-header') {
							loadExample(exampleCookieHeader);
							mode = 'cookie';
						}
					}}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				>
					<option value="">{tStringReactive('cookieDebugger.example', lang)}</option>
					<option value="samesite-none">{tStringReactive('cookieDebugger.exampleSameSiteNone', lang)}</option>
					<option value="cross-site">{tStringReactive('cookieDebugger.exampleCrossSite', lang)}</option>
					<option value="valid-session">{tStringReactive('cookieDebugger.exampleValidSession', lang)}</option>
					<option value="domain-mismatch">{tStringReactive('cookieDebugger.exampleDomainMismatch', lang)}</option>
					<option value="multiple">{tStringReactive('cookieDebugger.exampleMultiple', lang)}</option>
					<option value="cookie-header">{tStringReactive('cookieDebugger.exampleCookieHeader', lang)}</option>
				</select>
			</div>
		</div>

		<!-- Main content: 2-column layout -->
		{#if parsedResult}
			<div class="grid lg:grid-cols-2 gap-6">
				<!-- Left: Context Simulator + Issues + Cookies list -->
				<div class="space-y-4">
					<ContextSimulator
						context={cookieContext}
						onContextChange={handleContextChange}
						locale={(key) => tStringReactive(key, lang)}
					/>

					<IssuesPanel
						issues={allIssues}
						locale={(key) => tStringReactive(key, lang)}
						onSelectCookie={handleSelectCookieFromIssue}
					/>

					<div>
						<div class="flex items-center justify-between mb-3">
							<h2 class="text-lg font-semibold">
								{tStringReactive('cookieDebugger.cookiesList', lang)} ({filteredCookies.length})
							</h2>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									bind:checked={showOnlyIssues}
									class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
								/>
								<span class="text-xs text-[var(--color-text-muted)]">
									{tStringReactive('cookieDebugger.showOnlyIssues', lang)}
								</span>
							</label>
						</div>
						<div class="space-y-2 max-h-[600px] overflow-y-auto">
							{#each filteredCookies as cookie (cookie.name + cookie.value)}
								<CookieCard
									cookie={cookie}
									selected={selectedCookie?.name === cookie.name && selectedCookie?.value === cookie.value}
									onSelect={handleCookieSelect}
								/>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right: Details panel -->
				<div>
					<CookieDetails
						cookie={selectedCookie}
						context={cookieContext}
						locale={(key) => tStringReactive(key, lang)}
					/>
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-[var(--color-text-muted)]">
				<p>{tStringReactive('cookieDebugger.noCookies', lang)}</p>
			</div>
		{/if}
	</div>

	<!-- About Section -->
	<section class="mt-8 sm:mt-16">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
			{tStringReactive('cookieDebugger.whatIs', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('cookieDebugger.whatIsDescription', lang)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6">
			{tStringReactive('cookieDebugger.commonIssues', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('cookieDebugger.commonIssuesDescription', lang)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6">
			{tStringReactive('cookieDebugger.privacy', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('cookieDebugger.privacyText', lang)}
		</p>
	</section>
</div>

