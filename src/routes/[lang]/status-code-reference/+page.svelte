<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { tStringReactive, type Locale } from '$lib/i18n';
	import {
		statusCodes,
		searchStatusCodes,
		filterStatusCodes
	} from '$lib/tools/status-code-reference';
	import type { StatusCode } from '$lib/tools/status-code-reference';
	import StatusCodeCard from '$lib/qatools/status-codes/components/StatusCodeCard.svelte';
	import StatusCodeDetails from '$lib/qatools/status-codes/components/StatusCodeDetails.svelte';
	import FiltersBar from '$lib/qatools/status-codes/components/FiltersBar.svelte';
	import { BookOpen } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://qatools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/status-code-reference`);

	let searchQuery = $state('');
	let category = $state('all');
	let commonOnly = $state(false);
	let selectedCode = $state<StatusCode | null>(null);
	
	let filteredCodes = $derived.by(() => {
		const currentLang = lang;
		const localeFn = (key: string) => tStringReactive(key, currentLang);
		const searched = searchQuery
			? searchStatusCodes(searchQuery, localeFn)
			: statusCodes;
		return filterStatusCodes(searched, category === 'all' ? null : category, commonOnly);
	});

	// Select first code by default
	$effect(() => {
		if (!selectedCode && filteredCodes.length > 0) {
			selectedCode = filteredCodes[0];
		}
	});

	// Update selected code if it's filtered out
	$effect(() => {
		if (selectedCode && !filteredCodes.find((c) => c.code === selectedCode?.code)) {
			selectedCode = filteredCodes.length > 0 ? filteredCodes[0] : null;
		}
	});

	// Handle keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (!selectedCode || filteredCodes.length === 0) return;

			const currentIndex = filteredCodes.findIndex((c) => c.code === selectedCode?.code);
			if (currentIndex === -1) return;

			const nextIndex =
				e.key === 'ArrowDown'
					? (currentIndex + 1) % filteredCodes.length
					: (currentIndex - 1 + filteredCodes.length) % filteredCodes.length;
			selectedCode = filteredCodes[nextIndex];
		} else if (e.key === 'Enter' && selectedCode) {
			// Already selected, no action needed
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<title>{tStringReactive('statusCodeReference.title', lang)}</title>
	<meta name="description" content={tStringReactive('statusCodeReference.description', lang)} />
	<meta property="og:title" content={tStringReactive('statusCodeReference.title', lang)} />
	<meta property="og:description" content={tStringReactive('statusCodeReference.description', lang)} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={tStringReactive('statusCodeReference.title', lang)} />
	<meta name="twitter:description" content={tStringReactive('statusCodeReference.description', lang)} />
	<link rel="canonical" href={currentUrl} />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Status Code Reference",
			"description": "${tStringReactive('statusCodeReference.description', lang)}",
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

<div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
	<!-- Header -->
	<header class="mb-6 sm:mb-8">
		<div class="flex gap-3 mb-4">
			<div class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
				<BookOpen class="w-6 h-6 text-amber-400" />
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold mb-3">
					{tStringReactive('statusCodeReference.heading', lang)}
				</h1>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
					{tStringReactive('statusCodeReference.subtitle', lang)}
				</p>
			</div>
		</div>
	</header>

	<!-- Controls -->
	<div class="mb-6">
		<FiltersBar
			{searchQuery}
			{category}
			{commonOnly}
			onSearchChange={(q) => (searchQuery = q)}
			onCategoryChange={(c) => (category = c)}
			onCommonOnlyChange={(co) => (commonOnly = co)}
			locale={(key: string) => tStringReactive(key, lang)}
		/>
	</div>

	<!-- Main content -->
	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Left: Codes list -->
		<div class="lg:col-span-2">
			{#if filteredCodes.length === 0}
				<div class="p-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center">
					<p class="text-sm text-[var(--color-text-muted)] mb-2">
						{tStringReactive('statusCodeReference.noResults', lang)}
					</p>
					<p class="text-xs text-[var(--color-text-muted)]/70">
						{tStringReactive('statusCodeReference.noResultsSuggestion', lang)}
					</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each filteredCodes as code (code.code)}
						<StatusCodeCard
							{code}
							selected={selectedCode?.code === code.code}
						onSelect={(c) => (selectedCode = c)}
						locale={(key: string) => tStringReactive(key, lang)}
						/>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Right: Details panel -->
		<div class="lg:col-span-1">
			<StatusCodeDetails
				code={selectedCode}
				locale={(key: string) => tStringReactive(key, lang)}
				onCodeSelect={(c) => {
					selectedCode = c;
					// Scroll to the selected code in the list
					setTimeout(() => {
						const element = document.querySelector(`[data-code="${c.code}"]`);
						if (element) {
							element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
						}
					}, 0);
				}}
			/>
		</div>
	</div>

	<!-- SEO Blocks -->
	<div class="mt-12 sm:mt-16 space-y-8">
		<!-- What is -->
		<section>
			<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
				{tStringReactive('statusCodeReference.whatIs', lang)}
			</h2>
			<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
				{tStringReactive('statusCodeReference.whatIsDescription', lang)}
			</p>
		</section>

		<!-- QA Usage -->
		<section>
			<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
				{tStringReactive('statusCodeReference.qaUsage', lang)}
			</h2>
			<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
				{tStringReactive('statusCodeReference.qaUsageDescription', lang)}
			</p>
		</section>

		<!-- Common Mistakes -->
		<section>
			<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
				{tStringReactive('statusCodeReference.commonMistakes', lang)}
			</h2>
			<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
				{tStringReactive('statusCodeReference.commonMistakesDescription', lang)}
			</p>
		</section>
	</div>
</div>
