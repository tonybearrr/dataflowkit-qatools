<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tReactive, tStringReactive, getPath, type Locale } from '$lib/i18n';
	import { Database, CircleCheckBig, BookOpen, Braces, FileText, Cookie, Shield } from 'lucide-svelte';

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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-red-400 transition-all hover:shadow-lg hover:shadow-red-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/15 transition-colors"
			>
				<Braces class="w-6 h-6 text-red-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-red-400 transition-colors">
				{tStringReactive('home.payloadBuilder.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.payloadBuilder.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.payloadBuilder.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
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
			href={getPath('/headers-inspector', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors"
			>
				<FileText class="w-6 h-6 text-indigo-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
				{tStringReactive('home.headersInspector.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.headersInspector.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.headersInspector.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/cookie-debugger', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-orange-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/15 transition-colors"
			>
				<Cookie class="w-6 h-6 text-orange-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-orange-400 transition-colors">
				{tStringReactive('home.cookieDebugger.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.cookieDebugger.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.cookieDebugger.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/auth-debugger', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-pink-400 transition-all hover:shadow-lg hover:shadow-pink-400/10"
		>
			<div
				class="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/15 transition-colors"
			>
				<Shield class="w-6 h-6 text-pink-400" />
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-pink-400 transition-colors">
				{tStringReactive('home.authDebugger.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.authDebugger.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.authDebugger.tags', $locale) as string[]) as tag}
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
