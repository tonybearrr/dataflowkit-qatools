<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';

</script>

<svelte:head>
	<title>{tStringReactive('privacy.title', $locale)}</title>
	<meta name="description" content={tStringReactive('privacy.description', $locale)} />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">{tStringReactive('privacy.heading', $locale)}</h1>
	<div class="prose prose-sm max-w-none">
		<p class="text-lg text-[var(--color-text-muted)] mb-2">
			{tStringReactive('privacy.intro', $locale)}
		</p>
		<p class="text-lg text-[var(--color-text-muted)] mb-6">
			{tStringReactive('privacy.introLocal', $locale)}
		</p>
		<div class="space-y-6">
			<div>
				<h2 class="text-xl font-semibold mb-2">{tStringReactive('privacy.noDataCollection', $locale)}</h2>
				<p class="text-[var(--color-text-muted)]">
					{tStringReactive('privacy.noDataCollectionText', $locale)}
				</p>
			</div>
			<div>
				<h2 class="text-xl font-semibold mb-2">{tStringReactive('privacy.noAnalytics', $locale)}</h2>
				<p class="text-[var(--color-text-muted)]">
					{tStringReactive('privacy.noAnalyticsText', $locale)}
				</p>
			</div>
			<div>
				<h2 class="text-xl font-semibold mb-2">{tStringReactive('privacy.noBackend', $locale)}</h2>
				<p class="text-[var(--color-text-muted)]">
					{tStringReactive('privacy.noBackendText', $locale)}
				</p>
			</div>
			<div>
				<h2 class="text-xl font-semibold mb-2">{tStringReactive('privacy.openSource', $locale)}</h2>
				<p class="text-[var(--color-text-muted)]">
					{tStringReactive('privacy.openSourceText', $locale)}
				</p>
			</div>
		</div>
		<p class="mt-8 text-lg font-semibold">
			{tStringReactive('privacy.yourData', $locale)}
		</p>
		<p class="mt-2 text-lg text-[var(--color-text-muted)]">
			{tStringReactive('privacy.yourDataText', $locale)}
		</p>
	</div>
</div>
