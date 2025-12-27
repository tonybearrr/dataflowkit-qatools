<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import type { FieldSchema, GeneratorConfig, GeneratorResult } from '$lib/qatools/test-data';
	import { FieldType } from '$lib/qatools/test-data';
	import { generateDataset, validateSchema, loadSchema, saveSchema, loadConfig, saveConfig } from '$lib/qatools/test-data';
	import SchemaBuilder from '$lib/qatools/test-data/components/SchemaBuilder.svelte';
	import PreviewPanel from '$lib/qatools/test-data/components/PreviewPanel.svelte';
	import ExportPanel from '$lib/qatools/test-data/components/ExportPanel.svelte';
	import Presets from '$lib/qatools/test-data/components/Presets.svelte';
	import { Database } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://qatools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/test-data`);

	let schema = $state<FieldSchema[]>([]);
	let config = $state<GeneratorConfig>({
		rows: 10,
		seed: '',
		locale: 'en',
		output: 'json',
		includeHeaderRow: true
	});
	let result = $state<GeneratorResult | null>(null);
	let isGenerating = $state(false);
	let progress = $state(0);
	let activeTab = $state<'schema' | 'preview' | 'export'>('schema');
	let isMobile = $state(false);

	onMount(() => {
		// Load from localStorage
		const savedSchema = loadSchema();
		if (savedSchema.length > 0) {
			schema = savedSchema;
		}

		const savedConfig = loadConfig();
		if (Object.keys(savedConfig).length > 0) {
			config = { ...config, ...savedConfig };
		}

		// Check mobile
		isMobile = window.innerWidth < 768;

		// Auto-generate if schema exists
		if (schema.length > 0) {
			generate();
		}
	});

	function updateSchema(newSchema: FieldSchema[]) {
		schema = newSchema;
		saveSchema(schema);
		generate();
	}

	function updateConfig(newConfig: Partial<GeneratorConfig>) {
		config = { ...config, ...newConfig };
		saveConfig(config);
	}

	async function generate() {
		const validation = validateSchema(schema);
		if (!validation.valid) {
			result = { rows: [], warnings: validation.errors };
			return;
		}

		isGenerating = true;
		progress = 0;

		try {
			const generated = await generateDataset(
				schema,
				config,
				(p) => {
					progress = p;
				}
			);
			result = generated;
		} finally {
			isGenerating = false;
			progress = 0;
		}
	}

	function selectPreset(presetSchema: FieldSchema[]) {
		updateSchema(presetSchema);
	}
</script>

<svelte:head>
	<title>{tStringReactive('testDataGenerator.title', $locale)}</title>
	<meta name="description" content={tStringReactive('testDataGenerator.description', $locale)} />
	<meta property="og:title" content={tStringReactive('testDataGenerator.title', $locale)} />
	<meta property="og:description" content={tStringReactive('testDataGenerator.description', $locale)} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={tStringReactive('testDataGenerator.title', $locale)} />
	<meta name="twitter:description" content={tStringReactive('testDataGenerator.description', $locale)} />
	<link rel="canonical" href={currentUrl} />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Test Data Generator",
			"description": "${tStringReactive('testDataGenerator.description', $locale)}",
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
	<header class="mb-6 sm:mb-8">
		<div class="flex gap-3 mb-4">
			<div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
				<Database class="w-6 h-6 text-blue-400" />
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold mb-3">{tStringReactive('testDataGenerator.heading', $locale)}</h1>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
					{tStringReactive('testDataGenerator.subtitle', $locale)}
				</p>
			</div>
		</div>
	</header>

	{#if isMobile}
		<!-- Mobile: Tabs -->
		<div class="mb-4">
			<div class="flex border-b border-[var(--color-border)]">
				<button
					onclick={() => (activeTab = 'schema')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'schema' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					Schema
				</button>
				<button
					onclick={() => (activeTab = 'preview')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'preview' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					Preview
				</button>
				<button
					onclick={() => (activeTab = 'export')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'export' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					Export
				</button>
			</div>
		</div>

		<div class="space-y-6">
			{#if activeTab === 'schema'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<Presets schema={schema} onSelect={selectPreset} />
				</div>
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<SchemaBuilder {schema} onupdate={updateSchema} />
				</div>
			{:else if activeTab === 'preview'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<PreviewPanel {result} {schema} onRegenerate={generate} />
				</div>
			{:else if activeTab === 'export'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<ExportPanel {config} {result} onConfigUpdate={updateConfig} />
				</div>
			{/if}
		</div>
	{:else}
		<!-- Desktop: 2 columns -->
		<div class="grid lg:grid-cols-2 gap-6">
			<!-- Left: Schema Builder -->
			<div class="space-y-6">
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<Presets schema={schema} onSelect={selectPreset} />
				</div>
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<SchemaBuilder {schema} onupdate={updateSchema} />
				</div>
			</div>

			<!-- Right: Preview + Export -->
			<div class="space-y-6">
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<PreviewPanel {result} {schema} onRegenerate={generate} />
					{#if !result || result.rows.length === 0}
						<div class="mt-4">
							<button
								onclick={generate}
								class="w-full px-4 py-2 rounded bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white flex items-center justify-center gap-2 transition-colors"
							>
								Generate Data
							</button>
						</div>
					{/if}
				</div>
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<ExportPanel {config} {result} onConfigUpdate={updateConfig} />
				</div>
			</div>
		</div>
	{/if}

	{#if isGenerating}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div class="bg-[var(--color-bg)] p-6 rounded-lg border border-[var(--color-border)] max-w-sm w-full mx-4">
				<div class="mb-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">Generating data...</span>
						<span class="text-sm text-[var(--color-text-muted)]">{(progress * 100).toFixed(0)}%</span>
					</div>
					<div class="w-full h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
						<div
							class="h-full bg-[var(--color-accent)] transition-all duration-300"
							style="width: {progress * 100}%"
						></div>
					</div>
				</div>
				<p class="text-xs text-[var(--color-text-muted)]">
					Generating {config.rows} rows. This may take a moment for large datasets.
				</p>
			</div>
		</div>
	{/if}

	<section class="mt-8 sm:mt-16 prose prose-invert max-w-none">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{tStringReactive('testDataGenerator.whatIsTestData', $locale)}</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('testDataGenerator.testDataDescription', $locale)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">{tStringReactive('testDataGenerator.parameters', $locale)}</h2>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.presets', $locale)}</h3>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-2">
			{tStringReactive('testDataGenerator.presetsDescription', $locale)}
		</p>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('testDataGenerator.presetsList', $locale)}
		</p>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.fields', $locale)}</h3>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('testDataGenerator.fieldName', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.fieldType', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.fieldRequired', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.fieldManage', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.preview', $locale)}</h3>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-2">
			{tStringReactive('testDataGenerator.previewDescription', $locale)}
		</p>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('testDataGenerator.previewRegenerate', $locale)}
		</p>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.export', $locale)}</h3>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('testDataGenerator.exportRows', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.exportSeed', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.exportFormat', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.exportArrayKey', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.exportActions', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.features', $locale)}</h3>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('testDataGenerator.featureSchema', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.featureSeed', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.featureExport', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.featureLocal', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.useCases', $locale)}</h3>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('testDataGenerator.useCase1', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.useCase2', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.useCase3', $locale)}</li>
			<li>{tStringReactive('testDataGenerator.useCase4', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('testDataGenerator.privacy', $locale)}</h3>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('testDataGenerator.privacyText', $locale)}
		</p>
	</section>
</div>
