<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tReactive, tStringReactive, getPath, type Locale } from '$lib/i18n';
	import { Database, CircleCheckBig, BookOpen, Monitor, Cookie, FileText, ClipboardList, Braces } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://qatools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}`);
</script>

<svelte:head>
	<title>QA Toolbox - Privacy-First QA Testing Tools</title>
	<meta
		name="description"
		content={tStringReactive('home.description', $locale)}
	/>
	<meta property="og:title" content="QA Toolbox - Privacy-First QA Testing Tools" />
	<meta
		property="og:description"
		content={tStringReactive('home.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="QA Toolbox - Privacy-First QA Testing Tools" />
	<meta
		name="twitter:description"
		content={tStringReactive('home.description', $locale)}
	/>
	<link rel="canonical" href={currentUrl} />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8 sm:py-16">
	<div class="text-center mb-8 sm:mb-16">
		<h1 class="text-3xl sm:text-4xl font-bold mb-4">{tStringReactive('home.title', $locale)}</h1>
		<p class="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto px-4">
			{tStringReactive('home.description', $locale)}
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<a
			href={getPath('/test-data', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors"
			>
				<Database class="w-6 h-6 text-blue-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
				{tStringReactive('home.testDataGenerator.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.testDataGenerator.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.testDataGenerator.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/payload', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-purple-400 transition-all hover:shadow-lg hover:shadow-purple-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/15 transition-colors"
			>
				<Braces class="w-6 h-6 text-purple-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
				Payload Builder
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Build and break JSON payloads for API testing
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
					JSON
				</span>
				<span class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
					API Testing
				</span>
				<span class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
					Validation
				</span>
			</div>
		</a>

		<a
			href={getPath('/api-response-validator', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors"
			>
				<CircleCheckBig class="w-6 h-6 text-emerald-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
				{tStringReactive('home.apiResponseValidator.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.apiResponseValidator.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.apiResponseValidator.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/status-code-reference', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-amber-400 transition-all hover:shadow-lg hover:shadow-amber-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/15 transition-colors"
			>
				<BookOpen class="w-6 h-6 text-amber-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-amber-400 transition-colors">
				{tStringReactive('home.statusCodeReference.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.statusCodeReference.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.statusCodeReference.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/user-agent-parser', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-purple-400 transition-all hover:shadow-lg hover:shadow-purple-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/15 transition-colors"
			>
				<Monitor class="w-6 h-6 text-purple-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
				{tStringReactive('home.userAgentParser.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.userAgentParser.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.userAgentParser.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/cookie-inspector', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/15 transition-colors"
			>
				<Cookie class="w-6 h-6 text-cyan-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
				{tStringReactive('home.cookieInspector.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.cookieInspector.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.cookieInspector.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/header-inspector', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-rose-400 transition-all hover:shadow-lg hover:shadow-rose-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center mb-4 group-hover:bg-rose-500/15 transition-colors"
			>
				<FileText class="w-6 h-6 text-rose-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors">
				{tStringReactive('home.headerInspector.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.headerInspector.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.headerInspector.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/test-case-builder', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors"
			>
				<ClipboardList class="w-6 h-6 text-indigo-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
				{tStringReactive('home.testCaseBuilder.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.testCaseBuilder.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.testCaseBuilder.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>
	</div>
</div>
