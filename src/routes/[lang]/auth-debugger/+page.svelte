<script lang="ts">
	import { page } from '$app/stores';
	import { tStringReactive, type Locale } from '$lib/i18n';
	import { parseHttpDump, analyzeAuth, extractJwtFromAuth, decodeJwt } from '$lib/auth-debugger';
	import type { ParsedAuthData, AuthAnalysis, AuthIssue } from '$lib/auth-debugger';
	import SummaryCard from '$lib/auth-debugger/components/SummaryCard.svelte';
	import IssuesList from '$lib/auth-debugger/components/IssuesList.svelte';
	import IssueDetails from '$lib/auth-debugger/components/IssueDetails.svelte';
	import {
		example401MissingAuth,
		example401ExpiredToken,
		example403InsufficientPermissions,
		exampleCorsIssue,
		exampleCookieIssues
	} from '$lib/auth-debugger/examples';
	import { Copy, RefreshCw, Play, Shield } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://qatools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/auth-debugger`);

	let rawInput = $state('');
	let mode = $state<'request' | 'response' | 'combined'>('combined');
	let autoParse = $state(false);
	let isParsing = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Context
	let requestUrl = $state('');
	let method = $state('GET');
	let siteUrl = $state('');
	let inIframe = $state(false);
	let topLevelNav = $state(true);

	// Token inputs
	let authorizationHeader = $state('');
	let jwtToken = $state('');

	// Cookie inputs
	let cookieHeader = $state('');
	let setCookieHeaders = $state('');

	// Results
	let parsedData = $state<ParsedAuthData | null>(null);
	let analysis = $state<AuthAnalysis | null>(null);
	let selectedIssueId = $state<string | null>(null);

	function parse() {
		if (isParsing) return;
		if (!rawInput.trim()) {
			parsedData = null;
			analysis = null;
			return;
		}

		isParsing = true;
		setTimeout(() => {
			try {
				const context = {
					requestUrl: requestUrl || undefined,
					siteUrl: siteUrl || undefined,
					method: method || undefined,
					inIframe,
					topLevelNav
				};

				const parsed = parseHttpDump(rawInput, mode, context);

				// Fill input fields from parsed data (update if parsed data exists)
				// This allows users to see what was extracted from the dump
				if (parsed.authorization) {
					authorizationHeader = parsed.authorization;
					// Auto-extract JWT token if not already set
					if (!jwtToken) {
						const extracted = extractJwtFromAuth(parsed.authorization);
						if (extracted) {
							jwtToken = extracted;
						}
					}
				} else {
					authorizationHeader = '';
				}

				if (parsed.cookies.cookieHeader) {
					cookieHeader = parsed.cookies.cookieHeader;
				} else {
					cookieHeader = '';
				}

				if (parsed.cookies.setCookie.length > 0) {
					setCookieHeaders = parsed.cookies.setCookie.join('\n');
				} else {
					setCookieHeaders = '';
				}

				if (authorizationHeader.trim()) {
					parsed.authorization = authorizationHeader;
					parsed.requestHeaders['authorization'] = authorizationHeader;
				} else {
					parsed.authorization = null;
					delete parsed.requestHeaders['authorization'];
				}

				if (jwtToken.trim()) {
					const decoded = decodeJwt(jwtToken);
					parsed.jwt = decoded;
				} else {
					parsed.jwt = null;
				}

				if (cookieHeader.trim()) {
					parsed.cookies.cookieHeader = cookieHeader;
					parsed.requestHeaders['cookie'] = cookieHeader;
				} else {
					parsed.cookies.cookieHeader = null;
					delete parsed.requestHeaders['cookie'];
				}

				if (setCookieHeaders.trim()) {
					const lines = setCookieHeaders.split('\n').filter(l => l.trim());
					parsed.cookies.setCookie = lines;
				} else {
					parsed.cookies.setCookie = [];
				}

				parsedData = parsed;

				const result = analyzeAuth(parsed, mode);
				analysis = result;

				if (result.issues.length > 0) {
					selectedIssueId = result.issues[0].id;
				}
			} catch (error) {
				console.error('Parse error:', error);
				parsedData = null;
				analysis = null;
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
		if (autoParse && rawInput) {
			handleAutoParse();
		}
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	function reset() {
		rawInput = '';
		authorizationHeader = '';
		jwtToken = '';
		cookieHeader = '';
		setCookieHeaders = '';
		requestUrl = '';
		siteUrl = '';
		method = 'GET';
		inIframe = false;
		topLevelNav = true;
		parsedData = null;
		analysis = null;
		selectedIssueId = null;
	}

	function loadExample(example: string) {
		rawInput = example;
		parse();
	}

	function extractJwt() {
		// Try to extract from parsed data first, then from manual input
		const authHeader = parsedData?.authorization || authorizationHeader;
		if (authHeader) {
			const token = extractJwtFromAuth(authHeader);
			if (token) {
				jwtToken = token;
			}
		}
	}

	function copySummary() {
		if (!analysis) return;
		navigator.clipboard.writeText(analysis.summary);
	}

	function copyIssuesJson() {
		if (!analysis) return;
		navigator.clipboard.writeText(JSON.stringify(analysis.issues, null, 2));
	}

	function getSelectedIssue(): AuthIssue | null {
		if (!analysis || !selectedIssueId) return null;
		return analysis.issues.find(i => i.id === selectedIssueId) || null;
	}
</script>

<svelte:head>
	<title>{tStringReactive('authDebugger.title', lang)}</title>
	<meta name="description" content={tStringReactive('authDebugger.description', lang)} />
	<meta property="og:title" content={tStringReactive('authDebugger.title', lang)} />
	<meta property="og:description" content={tStringReactive('authDebugger.description', lang)} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={tStringReactive('authDebugger.title', lang)} />
	<meta name="twitter:description" content={tStringReactive('authDebugger.description', lang)} />
	<link rel="canonical" href={currentUrl} />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Auth Debugger",
			"description": "${tStringReactive('authDebugger.description', lang)}",
			"url": "${currentUrl}",
			"applicationCategory": "DeveloperApplication",
			"operatingSystem": "Web Browser",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			}
		}
		</script>
	`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
	<!-- Header -->
	<header class="mb-6 sm:mb-8">
		<div class="flex gap-3 mb-4">
			<div class="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
				<Shield class="w-6 h-6 text-pink-400" />
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold mb-3">
					{tStringReactive('authDebugger.heading', lang)}
				</h1>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
					{tStringReactive('authDebugger.subtitle', lang)}
				</p>
			</div>
		</div>
	</header>

	<!-- Main 2-column layout -->
	<div class="grid lg:grid-cols-2 gap-6">
		<!-- LEFT: Inputs -->
		<div class="space-y-6">
			<!-- Mode selector -->
			<div>
				<div class="block text-sm font-semibold mb-2">{tStringReactive('authDebugger.mode', lang)}</div>
				<div class="flex gap-4">
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="radio" bind:group={mode} value="request" class="w-4 h-4" />
						<span class="text-sm">{tStringReactive('authDebugger.modeRequest', lang)}</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="radio" bind:group={mode} value="response" class="w-4 h-4" />
						<span class="text-sm">{tStringReactive('authDebugger.modeResponse', lang)}</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="radio" bind:group={mode} value="combined" class="w-4 h-4" />
						<span class="text-sm">{tStringReactive('authDebugger.modeCombined', lang)}</span>
					</label>
				</div>
			</div>

			<!-- Raw HTTP dump -->
			<div>
				<label for="raw-input" class="block text-sm font-semibold mb-2">
					{tStringReactive('authDebugger.rawHttpDump', lang)}
				</label>
				<textarea
					id="raw-input"
					bind:value={rawInput}
					oninput={() => {
						if (autoParse) handleAutoParse();
					}}
					placeholder={tStringReactive('authDebugger.rawHttpDumpPlaceholder', lang)}
					class="w-full h-48 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
					spellcheck="false"
				></textarea>
				<div class="mt-2 mb-3">
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={autoParse} class="w-4 h-4" />
						<span class="text-xs text-[var(--color-text-muted)]">{tStringReactive('authDebugger.autoParse', lang)}</span>
					</label>
				</div>
				<div class="flex items-center gap-2">
					<button
						onclick={parse}
						disabled={isParsing}
						class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2 disabled:opacity-50"
					>
						<Play class="w-4 h-4" />
						{tStringReactive('common.parse', lang)}
					</button>
					<button
						onclick={reset}
						class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2"
					>
						<RefreshCw class="w-4 h-4" />
						{tStringReactive('authDebugger.reset', lang)}
					</button>
					<select
						value=""
						onchange={(e) => {
							const value = (e.target as HTMLSelectElement).value;
							if (value === '401-missing') loadExample(example401MissingAuth);
							else if (value === '401-expired') loadExample(example401ExpiredToken);
							else if (value === '403') loadExample(example403InsufficientPermissions);
							else if (value === 'cors') loadExample(exampleCorsIssue);
							else if (value === 'cookies') loadExample(exampleCookieIssues);
						}}
						class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
					>
						<option value="">{tStringReactive('authDebugger.example', lang)}</option>
						<option value="401-missing">{tStringReactive('authDebugger.example401Missing', lang)}</option>
						<option value="401-expired">{tStringReactive('authDebugger.example401Expired', lang)}</option>
						<option value="403">{tStringReactive('authDebugger.example403', lang)}</option>
						<option value="cors">{tStringReactive('authDebugger.exampleCors', lang)}</option>
						<option value="cookies">{tStringReactive('authDebugger.exampleCookies', lang)}</option>
					</select>
				</div>
			</div>

			<!-- Context -->
			<div class="space-y-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h3 class="text-sm font-semibold">{tStringReactive('authDebugger.optionalContext', lang)}</h3>
				<div>
					<label for="request-url" class="block text-xs text-[var(--color-text-muted)] mb-1">
						{tStringReactive('authDebugger.requestUrl', lang)}
					</label>
					<input
						id="request-url"
						type="text"
						bind:value={requestUrl}
						placeholder={tStringReactive('authDebugger.requestUrlPlaceholder', lang)}
						class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
					/>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="method" class="block text-xs text-[var(--color-text-muted)] mb-1">
							{tStringReactive('authDebugger.method', lang)}
						</label>
						<select
							id="method"
							bind:value={method}
							class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
						>
							<option>GET</option>
							<option>POST</option>
							<option>PUT</option>
							<option>DELETE</option>
							<option>PATCH</option>
						</select>
					</div>
					<div>
						<label for="site-url" class="block text-xs text-[var(--color-text-muted)] mb-1">
							{tStringReactive('authDebugger.siteUrl', lang)}
						</label>
						<input
							id="site-url"
							type="text"
							bind:value={siteUrl}
							placeholder={tStringReactive('authDebugger.siteUrlPlaceholder', lang)}
							class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
						/>
					</div>
				</div>
				<div class="flex gap-4">
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={inIframe} class="w-4 h-4" />
						<span class="text-xs">{tStringReactive('authDebugger.inIframe', lang)}</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={topLevelNav} class="w-4 h-4" />
						<span class="text-xs">{tStringReactive('authDebugger.topLevelNav', lang)}</span>
					</label>
				</div>
			</div>

			<!-- Token section -->
			<div class="space-y-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h3 class="text-sm font-semibold">{tStringReactive('authDebugger.token', lang)}</h3>
				<div>
					<label for="auth-header" class="block text-xs text-[var(--color-text-muted)] mb-1">
						{tStringReactive('authDebugger.authorizationHeader', lang)}
					</label>
					<input
						id="auth-header"
						type="text"
						bind:value={authorizationHeader}
						placeholder={tStringReactive('authDebugger.authorizationHeaderPlaceholder', lang)}
						class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
					/>
				</div>
				<div>
					<label for="jwt-token" class="block text-xs text-[var(--color-text-muted)] mb-1">
						{tStringReactive('authDebugger.jwtToken', lang)}
					</label>
					<div class="flex gap-2">
						<input
							id="jwt-token"
							type="text"
							bind:value={jwtToken}
							placeholder={tStringReactive('authDebugger.jwtTokenPlaceholder', lang)}
							class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
						/>
						<button
							onclick={extractJwt}
							class="px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
						>
							{tStringReactive('authDebugger.extract', lang)}
						</button>
					</div>
				</div>
			</div>

			<!-- Cookies section -->
			<div class="space-y-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h3 class="text-sm font-semibold">{tStringReactive('authDebugger.cookies', lang)}</h3>
				<div>
					<label for="cookie-header" class="block text-xs text-[var(--color-text-muted)] mb-1">
						{tStringReactive('authDebugger.cookieHeader', lang)}
					</label>
					<input
						id="cookie-header"
						type="text"
						bind:value={cookieHeader}
						placeholder={cookieHeader ? '' : '-'}
						class="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
					/>
				</div>
				<div>
					<label for="set-cookie" class="block text-xs text-[var(--color-text-muted)] mb-1">
						{tStringReactive('authDebugger.setCookieHeaders', lang)}
					</label>
					<textarea
						id="set-cookie"
						bind:value={setCookieHeaders}
						placeholder={setCookieHeaders ? '' : '-'}
						class="w-full h-24 p-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
					></textarea>
				</div>
			</div>
		</div>

		<!-- RIGHT: Results -->
		<div class="space-y-6">
			{#if analysis}
				<SummaryCard {analysis} />

				<div class="grid grid-cols-2 gap-2">
					<button
						onclick={copySummary}
						class="px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center justify-center gap-2"
					>
						<Copy class="w-3 h-3" />
						{tStringReactive('authDebugger.copySummary', lang)}
					</button>
					<button
						onclick={copyIssuesJson}
						class="px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center justify-center gap-2"
					>
						<Copy class="w-3 h-3" />
						{tStringReactive('authDebugger.copyIssuesJson', lang)}
					</button>
				</div>

				{#if analysis.issues.length > 0}
					<IssuesList
						issues={analysis.issues}
						selectedIssueId={selectedIssueId}
						onSelectIssue={(id: string) => (selectedIssueId = id)}
						locale={lang}
					/>
				{/if}

				<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<IssueDetails issue={getSelectedIssue()} />
				</div>
			{:else}
				<div class="text-center py-12 text-[var(--color-text-muted)]">
					<p class="text-sm">{tStringReactive('authDebugger.emptyState', lang)}</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- About Section -->
	<section class="mt-8 sm:mt-16">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
			{tStringReactive('authDebugger.whatIs', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4 max-w-[60rem]">
			{tStringReactive('authDebugger.whatIsDescription', lang)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6">
			{tStringReactive('authDebugger.useCases', lang)}
		</h2>
		<ul class="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			<li>{tStringReactive('authDebugger.useCases1', lang)}</li>
			<li>{tStringReactive('authDebugger.useCases2', lang)}</li>
			<li>{tStringReactive('authDebugger.useCases3', lang)}</li>
			<li>{tStringReactive('authDebugger.useCases4', lang)}</li>
		</ul>

		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6">
			{tStringReactive('authDebugger.commonProblems', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('authDebugger.commonProblemsDescription', lang)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6">
			{tStringReactive('authDebugger.commonQuestions', lang)}
		</h2>
		<div class="space-y-4 mb-4">
			<div>
				<h3 class="text-base sm:text-lg font-semibold mb-2 text-[var(--color-text)]">
					{tStringReactive('authDebugger.question1', lang)}
				</h3>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
					{tStringReactive('authDebugger.answer1', lang)}
				</p>
			</div>
			<div>
				<h3 class="text-base sm:text-lg font-semibold mb-2 text-[var(--color-text)]">
					{tStringReactive('authDebugger.question2', lang)}
				</h3>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
					{tStringReactive('authDebugger.answer2', lang)}
				</p>
			</div>
			<div>
				<h3 class="text-base sm:text-lg font-semibold mb-2 text-[var(--color-text)]">
					{tStringReactive('authDebugger.question3', lang)}
				</h3>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
					{tStringReactive('authDebugger.answer3', lang)}
				</p>
			</div>
		</div>

		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6">
			{tStringReactive('authDebugger.privacy', lang)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('authDebugger.privacyText', lang)}
		</p>
	</section>
</div>

