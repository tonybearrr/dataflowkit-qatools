<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { tStringReactive, type Locale } from '$lib/i18n';
	import {
		parseHeaders,
		detectIssues,
		type ParsedHeader,
		type ParsedHeadersResult,
		exampleRequestHeaders,
		exampleResponseHeaders,
		exampleCorsError,
		exampleCookieIssue
	} from '$lib/qatools/headers';
	import { analyzeHeaderIssues } from '$lib/qatools/headers/issues';
	import HeaderCard from '$lib/qatools/headers/components/HeaderCard.svelte';
	import HeaderDetails from '$lib/qatools/headers/components/HeaderDetails.svelte';
	import IssuesPanel from '$lib/qatools/headers/components/IssuesPanel.svelte';
	import { FileText, RefreshCw, Play, LoaderCircle } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);

	let rawHeaders = $state('');
	let requestType = $state<'request' | 'response'>('request');
	let autoParse = $state(false);
	let parsedResult = $state<ParsedHeadersResult | null>(null);
	let selectedHeader = $state<ParsedHeader | null>(null);
	let isParsing = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let highlightedHeaderRow: string | null = $state(null);

	const headerIssues = $derived(
		parsedResult ? analyzeHeaderIssues(parsedResult.headers, requestType) : []
	);

	function parse() {
		if (isParsing) return;
		if (!rawHeaders.trim()) {
			parsedResult = null;
			selectedHeader = null;
			return;
		}

		isParsing = true;
		setTimeout(() => {
			const result = parseHeaders(rawHeaders, requestType);
			const issues = detectIssues(result);
			result.issues = issues;
			parsedResult = result;
			isParsing = false;
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
		if (autoParse && rawHeaders) {
			handleAutoParse();
		}
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	function reset() {
		rawHeaders = '';
		parsedResult = null;
		selectedHeader = null;
		requestType = 'request';
		autoParse = false;
	}

	function loadExample(example: string) {
		rawHeaders = example;
		if (autoParse) {
			parse();
		}
	}

	function handleHeaderSelect(header: ParsedHeader) {
		selectedHeader = header;
	}

	function handleSelectHeaderFromIssue(normalizedName: string) {
		if (!parsedResult) return;

		const header = parsedResult.headers.find((h) => h.normalizedName === normalizedName);
		if (!header) return;

		selectedHeader = header;

		// Scroll to header
		requestAnimationFrame(() => {
			const element = document.querySelector(
				`[data-header-row="${normalizedName}"]`
			) as HTMLElement;
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });

				// Highlight
				highlightedHeaderRow = normalizedName;
				element.classList.add('issue-pulse');
				setTimeout(() => {
					element.classList.remove('issue-pulse');
					highlightedHeaderRow = null;
				}, 1200);
			}
		});
	}

	onMount(() => {
		// Load from localStorage if available
		const saved = localStorage.getItem('headers-inspector-state');
		if (saved) {
			try {
				const state = JSON.parse(saved);
				rawHeaders = state.rawHeaders || '';
				requestType = state.requestType || 'request';
				autoParse = state.autoParse || false;
				if (rawHeaders && autoParse) {
					parse();
				}
			} catch {
				// Ignore
			}
		}
	});

	$effect(() => {
		if (rawHeaders || requestType !== 'request' || autoParse !== false) {
			localStorage.setItem(
				'headers-inspector-state',
				JSON.stringify({
					rawHeaders,
					requestType,
					autoParse
				})
			);
		}
	});
</script>

<svelte:head>
	<style>
		@keyframes issue-pulse {
			0%,
			100% {
				box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
			}
			50% {
				box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
			}
		}

		[data-header-row].issue-pulse {
			animation: issue-pulse 1.2s ease-in-out !important;
			border-color: var(--color-accent) !important;
		}
	</style>
	<title>{tStringReactive('headersInspector.title', lang)}</title>
	<meta name="description" content={tStringReactive('headersInspector.description', lang)} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
	<!-- Header -->
	<header class="mb-6 sm:mb-8">
		<div class="flex gap-3 mb-4">
			<div class="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
				<FileText class="w-6 h-6 text-indigo-400" />
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold mb-3">
					{tStringReactive('headersInspector.heading', lang)}
				</h1>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
					{tStringReactive('headersInspector.subtitle', lang)}
				</p>
			</div>
		</div>
	</header>

	<div class="space-y-6">
		<!-- Controls -->
		<div class="space-y-4">
			<!-- Input textarea -->
			<div>
				<label for="headers-input" class="block text-sm font-semibold mb-2">
					{tStringReactive('headersInspector.inputLabel', lang)}
				</label>
				<textarea
					id="headers-input"
					bind:value={rawHeaders}
					oninput={() => {
						if (autoParse) handleAutoParse();
					}}
					placeholder={tStringReactive('headersInspector.placeholder', lang)}
					class="w-full h-48 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
					spellcheck="false"
				></textarea>
			</div>

			<!-- Controls row -->
			<div class="flex flex-wrap items-center gap-3">
				<!-- Request/Response toggle -->
				<div class="flex items-center gap-2">
					<label class="text-sm text-[var(--color-text-muted)]">
						{tStringReactive('headersInspector.typeLabel', lang)}
					</label>
					<select
						bind:value={requestType}
						onchange={() => {
							if (autoParse && rawHeaders) parse();
						}}
						class="px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
					>
						<option value="request">{tStringReactive('headersInspector.typeRequest', lang)}</option>
						<option value="response">{tStringReactive('headersInspector.typeResponse', lang)}</option>
					</select>
				</div>

				<!-- Auto-parse toggle -->
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={autoParse}
						class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
					/>
					<span class="text-sm text-[var(--color-text-muted)]">
						{tStringReactive('headersInspector.autoParse', lang)}
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
					{tStringReactive('headersInspector.parse', lang)}
				</button>

				<button
					onclick={reset}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2"
				>
					<RefreshCw class="w-4 h-4" />
					{tStringReactive('headersInspector.reset', lang)}
				</button>

				<!-- Example dropdown -->
				<select
					value=""
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						const value = target.value;
						if (value === 'request') {
							loadExample(exampleRequestHeaders);
						} else if (value === 'response') {
							loadExample(exampleResponseHeaders);
						} else if (value === 'cors-error') {
							loadExample(exampleCorsError);
						} else if (value === 'cookie-issue') {
							loadExample(exampleCookieIssue);
						}
					}}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				>
					<option value="">{tStringReactive('headersInspector.example', lang)}</option>
					<option value="request">{tStringReactive('headersInspector.exampleRequest', lang)}</option>
					<option value="response">{tStringReactive('headersInspector.exampleResponse', lang)}</option>
					<option value="cors-error">{tStringReactive('headersInspector.exampleCors', lang)}</option>
					<option value="cookie-issue">{tStringReactive('headersInspector.exampleCookie', lang)}</option>
				</select>
			</div>
		</div>

		<!-- Main content: 2-column layout -->
		{#if parsedResult}
			<div class="grid lg:grid-cols-2 gap-6">
				<!-- Left: Headers list -->
				<div class="space-y-4">
					<IssuesPanel
						issues={headerIssues}
						locale={(key) => tStringReactive(key, lang)}
						onSelectHeader={handleSelectHeaderFromIssue}
					/>

					<div>
						<h2 class="text-lg font-semibold mb-3">
							{tStringReactive('headersInspector.headersList', lang)} ({parsedResult.headers.length})
						</h2>
						<div class="space-y-2 max-h-[600px] overflow-y-auto">
							{#each parsedResult.headers as header (header.name + header.value)}
								<HeaderCard
									header={header}
									selected={selectedHeader?.name === header.name && selectedHeader?.value === header.value}
									onSelect={handleHeaderSelect}
								/>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right: Details panel -->
				<div>
					<HeaderDetails
						header={selectedHeader}
						allHeaders={parsedResult.headers}
						mode={requestType}
						locale={(key) => tStringReactive(key, lang)}
					/>
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-[var(--color-text-muted)]">
				<p>{tStringReactive('headersInspector.noHeaders', lang)}</p>
			</div>
		{/if}
	</div>

	<!-- About Section -->
	<section class="mt-8 sm:mt-16">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
			{tStringReactive('headersInspector.whatIs', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('headersInspector.whatIsDescription', lang)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
			{tStringReactive('headersInspector.whatYouCanDo', lang)}
		</h2>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('headersInspector.whatYouCanDo1', lang)}</li>
			<li>{tStringReactive('headersInspector.whatYouCanDo2', lang)}</li>
			<li>{tStringReactive('headersInspector.whatYouCanDo3', lang)}</li>
			<li>{tStringReactive('headersInspector.whatYouCanDo4', lang)}</li>
			<li>{tStringReactive('headersInspector.whatYouCanDo5', lang)}</li>
		</ul>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
			{tStringReactive('headersInspector.privacy', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('headersInspector.privacyText', lang)}
		</p>
	</section>
</div>

