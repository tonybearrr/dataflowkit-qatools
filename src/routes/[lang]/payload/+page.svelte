<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import type { JsonNode, PayloadVariant, PayloadTemplate } from '$lib/qatools/payload';
	import {
		jsonToTree,
		treeToJson,
		generateId,
		applyRules,
		templates,
		getTemplate
	} from '$lib/qatools/payload';
	import { validateJson, formatJson } from '$lib/qatools/payload';
	import {
		loadState,
		saveBasePayload,
		saveVariants,
		saveSelectedVariant,
		saveSelectedTemplate,
		saveUIPreferences
	} from '$lib/qatools/payload';
	import TreeBuilder from '$lib/qatools/payload/components/TreeBuilder.svelte';
	import JsonEditor from '$lib/qatools/payload/components/JsonEditor.svelte';
	import BreakerPanel from '$lib/qatools/payload/components/BreakerPanel.svelte';
	import OutputPanel from '$lib/qatools/payload/components/OutputPanel.svelte';
	import { Code2 } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);

	let tree = $state<JsonNode | null>(null);
	let jsonString = $state('{}');
	let basePayload = $state<any>({});
	let templateMetadata = $state<PayloadTemplate['metadata']>(undefined);
	let variants = $state<PayloadVariant[]>([]);
	let selectedVariantId = $state<string | undefined>('base');
	let activeTab = $state<'builder' | 'json' | 'break' | 'output'>('builder');
	let isMobile = $state(false);
	let showDiff = $state(false);
	let selectedPath = $state('');

	onMount(() => {
		isMobile = window.innerWidth < 768;
		const saved = loadState();
		if (saved.basePayload?.tree && saved.basePayload?.raw) {
			tree = saved.basePayload.tree;
			jsonString = saved.basePayload.raw;
			basePayload = JSON.parse(saved.basePayload.raw);
		}
		if (saved.variants) {
			variants = saved.variants;
		}
		if (saved.selectedVariantId) {
			selectedVariantId = saved.selectedVariantId;
		}
		if (saved.uiPreferences?.lastTab) {
			activeTab = saved.uiPreferences.lastTab as any;
		}
	});

	function updateTree(newTree: JsonNode | null) {
		tree = newTree;
		if (newTree) {
			basePayload = treeToJson(newTree);
			jsonString = formatJson(basePayload, false);
			saveBasePayload(newTree, jsonString);
			regenerateVariants();
		}
	}

	function updateJson(newJson: string) {
		jsonString = newJson;
		const result = validateJson(newJson);
		if (result.valid && result.json) {
			basePayload = result.json;
			tree = jsonToTree(result.json);
			saveBasePayload(tree, jsonString);
			regenerateVariants();
		}
	}

	function handleValidJson(json: any) {
		basePayload = json;
		tree = jsonToTree(json);
		saveBasePayload(tree, jsonString);
		regenerateVariants();
	}

	function selectTemplate(templateId: string) {
		const template = getTemplate(templateId);
		if (!template) return;

		basePayload = template.payload;
		templateMetadata = template.metadata;
		jsonString = formatJson(basePayload, false);
		tree = jsonToTree(basePayload);
		saveBasePayload(tree, jsonString);
		saveSelectedTemplate(templateId);
		variants = [];
		selectedVariantId = 'base';
		regenerateVariants();
	}

	function regenerateVariants() {
		for (const variant of variants) {
			const result = applyRules(basePayload, variant.rules);
			variant.payload = result.payload;
			variant.warnings = result.warnings;
		}
		saveVariants(variants);
	}

	function handleVariantCreate(variant: PayloadVariant) {
		variants = [...variants, variant];
		regenerateVariants();
		saveVariants(variants);
	}

	function handleVariantDelete(variantId: string) {
		variants = variants.filter((v) => v.id !== variantId);
		if (selectedVariantId === variantId) {
			selectedVariantId = 'base';
		}
		saveVariants(variants);
		saveSelectedVariant(selectedVariantId);
	}

	function handleVariantUpdate(variant: PayloadVariant) {
		const index = variants.findIndex((v) => v.id === variant.id);
		if (index !== -1) {
			variants[index] = variant;
			regenerateVariants();
			saveVariants(variants);
		}
	}

	function handleVariantRegenerate(variant: PayloadVariant) {
		regenerateVariants();
	}

	function handleVariantSelect(variantId: string) {
		selectedVariantId = variantId;
		saveSelectedVariant(variantId);
	}

	function handleNodeSelect(nodeId: string, path: string) {
		selectedPath = path;
	}

	function handleTabChange(tab: typeof activeTab) {
		activeTab = tab;
		saveUIPreferences({ lastTab: tab });
	}

	const selectedVariant = $derived(
		selectedVariantId && selectedVariantId !== 'base'
			? variants.find((v) => v.id === selectedVariantId)
			: undefined
	);
</script>

<svelte:head>
	<title>Payload Builder - QA Toolbox</title>
	<meta name="description" content="Build and break JSON payloads for API testing. Create invalid variants to test validation." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
	<header class="mb-6 sm:mb-8">
		<h1 class="text-2xl sm:text-3xl font-bold mb-3">Payload Builder + Breaker</h1>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
			Build JSON payloads visually or in code. Generate invalid variants to test API validation.
		</p>
	</header>

	{#if isMobile}
		<div class="mb-4">
			<div class="flex border-b border-[var(--color-border)]">
				<button
					onclick={() => handleTabChange('builder')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'builder' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					Builder
				</button>
				<button
					onclick={() => handleTabChange('json')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'json' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					JSON
				</button>
				<button
					onclick={() => handleTabChange('break')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'break' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					Break
				</button>
				<button
					onclick={() => handleTabChange('output')}
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'output' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)]'}"
				>
					Output
				</button>
			</div>
		</div>

		<div class="space-y-6">
			{#if activeTab === 'builder'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<div class="mb-4">
						<h3 class="text-sm font-semibold mb-2">Templates</h3>
						<div class="grid grid-cols-2 gap-2">
							{#each templates as template}
								<button
									onclick={() => selectTemplate(template.id)}
									class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
								>
									<div class="text-sm font-semibold">{template.name}</div>
									<div class="text-xs text-[var(--color-text-muted)]">{template.description}</div>
								</button>
							{/each}
						</div>
					</div>
					<TreeBuilder {tree} onUpdate={updateTree} onNodeSelect={handleNodeSelect} />
				</div>
			{:else if activeTab === 'json'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-[400px] flex flex-col">
					<div class="flex-1 min-h-0">
						<JsonEditor value={jsonString} onChange={updateJson} onValidJson={handleValidJson} />
					</div>
				</div>
			{:else if activeTab === 'break'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<BreakerPanel
						{basePayload}
						{variants}
						{selectedVariantId}
						metadata={templateMetadata}
						onVariantSelect={handleVariantSelect}
						onVariantCreate={handleVariantCreate}
						onVariantDelete={handleVariantDelete}
						onVariantUpdate={handleVariantUpdate}
						onRegenerate={handleVariantRegenerate}
					/>
				</div>
			{:else if activeTab === 'output'}
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-[400px]">
					<OutputPanel
						{basePayload}
						baseJsonString={jsonString}
						{selectedVariant}
						{showDiff}
						onShowDiffChange={(v) => (showDiff = v)}
					/>
				</div>
			{/if}
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Templates: Full width -->
			<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h3 class="text-sm font-semibold mb-3">Templates</h3>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
					{#each templates as template}
						<button
							onclick={() => selectTemplate(template.id)}
							class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
						>
							<div class="text-sm font-semibold mb-1">{template.name}</div>
							<div class="text-xs text-[var(--color-text-muted)]">{template.description}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- JSON Editor and Tree Builder: 2 columns -->
			<div class="grid lg:grid-cols-2 gap-6">
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-[500px] flex flex-col">
					<h3 class="text-sm font-semibold mb-3 flex-shrink-0">JSON Editor</h3>
					<div class="flex-1 min-h-0">
						<JsonEditor value={jsonString} onChange={updateJson} onValidJson={handleValidJson} />
					</div>
				</div>
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-[500px] overflow-auto">
					<h3 class="text-sm font-semibold mb-3">Tree Builder</h3>
					<TreeBuilder {tree} onUpdate={updateTree} onNodeSelect={handleNodeSelect} />
				</div>
			</div>

			<!-- Variants and Output: 2 columns -->
			<div class="grid lg:grid-cols-2 gap-6">
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
					<h3 class="text-sm font-semibold mb-3">Variants & Breaker</h3>
					<BreakerPanel
						{basePayload}
						{variants}
						{selectedVariantId}
						metadata={templateMetadata}
						onVariantSelect={handleVariantSelect}
						onVariantCreate={handleVariantCreate}
						onVariantDelete={handleVariantDelete}
						onVariantUpdate={handleVariantUpdate}
						onRegenerate={handleVariantRegenerate}
					/>
				</div>
				<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-[500px]">
					<h3 class="text-sm font-semibold mb-3">Output</h3>
					<OutputPanel
						{basePayload}
						baseJsonString={jsonString}
						{selectedVariant}
						{showDiff}
						onShowDiffChange={(v) => (showDiff = v)}
					/>
				</div>
			</div>
		</div>
	{/if}

	<section class="mt-8 sm:mt-16 prose prose-invert max-w-none">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{tStringReactive('payloadBuilder.whatIsPayloadBuilder', $locale)}</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('payloadBuilder.payloadBuilderDescription', $locale)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">{tStringReactive('payloadBuilder.parameters', $locale)}</h2>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li><strong>{tStringReactive('payloadBuilder.templates', $locale)}</strong> — {tStringReactive('payloadBuilder.templatesDescription', $locale)}</li>
			<li><strong>{tStringReactive('payloadBuilder.jsonEditor', $locale)}</strong> — {tStringReactive('payloadBuilder.jsonEditorDescription', $locale)}</li>
			<li><strong>{tStringReactive('payloadBuilder.treeBuilder', $locale)}</strong> — {tStringReactive('payloadBuilder.treeBuilderDescription', $locale)}</li>
			<li><strong>{tStringReactive('payloadBuilder.breaker', $locale)}</strong> — {tStringReactive('payloadBuilder.breakerDescription', $locale)}</li>
			<li><strong>{tStringReactive('payloadBuilder.output', $locale)}</strong> — {tStringReactive('payloadBuilder.outputDescription', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('payloadBuilder.privacy', $locale)}</h3>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('payloadBuilder.privacyText', $locale)}
		</p>
	</section>
</div>
