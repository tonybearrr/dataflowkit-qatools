<script lang="ts">
	import type { PayloadVariant } from '../types';
	import { validateJson, formatJson } from '../validate';
	import { computeDiff } from '../diff';
	import { copyToClipboard, downloadFile } from '../export';
	import { Copy, Download, Eye, EyeOff } from 'lucide-svelte';

	interface Props {
		basePayload: any;
		baseJsonString?: string;
		selectedVariant?: PayloadVariant;
		showDiff?: boolean;
		onShowDiffChange?: (show: boolean) => void;
	}

	let { basePayload, baseJsonString, selectedVariant, showDiff = false, onShowDiffChange }: Props = $props();

	let copied = $state(false);

	$effect(() => {
		if (copied) {
			setTimeout(() => (copied = false), 2000);
		}
	});

	const currentPayload = $derived(selectedVariant?.payload || basePayload);
	const currentJson = $derived(
		selectedVariant
			? formatJson(currentPayload, false)
			: baseJsonString && validateJson(baseJsonString).valid
				? baseJsonString
				: formatJson(currentPayload, false)
	);
	const validation = $derived(validateJson(currentJson));

	const diff = $derived(
		showDiff && selectedVariant ? computeDiff(basePayload, selectedVariant.payload || {}) : []
	);

	async function handleCopy() {
		const success = await copyToClipboard(currentJson);
		if (success) {
			copied = true;
		}
	}

	function handleDownload() {
		downloadFile('payload.json', currentJson, 'application/json');
	}
</script>

<div class="flex flex-col h-full">
	<div class="flex items-center justify-between mb-2">
		<div class="flex items-center gap-2">
			{#if validation.valid}
				<span class="text-xs text-[var(--color-success)]">✓ Valid JSON</span>
			{:else}
				<span class="text-xs text-[var(--color-error)]">✗ Invalid JSON</span>
			{/if}
			{#if selectedVariant && selectedVariant.warnings && selectedVariant.warnings.length > 0}
				<span class="text-xs text-[var(--color-warning)]">
					{selectedVariant.warnings.length} warning{selectedVariant.warnings.length !== 1 ? 's' : ''}
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			{#if selectedVariant}
				<button
					onclick={() => onShowDiffChange?.(!showDiff)}
					class="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] flex items-center gap-1"
					title="Toggle diff view"
				>
					{#if showDiff}
						<EyeOff class="w-4 h-4" />
					{:else}
						<Eye class="w-4 h-4" />
					{/if}
				</button>
			{/if}
			<button
				onclick={handleCopy}
				class="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] flex items-center gap-1 {copied ? 'bg-[var(--color-success)]/20' : ''}"
				title="Copy to clipboard"
			>
				<Copy class="w-4 h-4" />
				{copied ? 'Copied!' : 'Copy'}
			</button>
			<button
				onclick={handleDownload}
				class="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] flex items-center gap-1"
				title="Download JSON"
			>
				<Download class="w-4 h-4" />
			</button>
		</div>
	</div>

	{#if showDiff && selectedVariant}
		<div class="grid grid-cols-2 gap-4 flex-1 overflow-auto">
			<div>
				<div class="text-xs font-semibold mb-1">Base</div>
				<pre class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs font-mono overflow-auto h-full">{formatJson(basePayload, false)}</pre>
			</div>
			<div>
				<div class="text-xs font-semibold mb-1">Variant: {selectedVariant.name}</div>
				<pre class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs font-mono overflow-auto h-full">{formatJson(selectedVariant.payload || {}, false)}</pre>
			</div>
		</div>
		{#if diff.length > 0}
			<div class="mt-2 p-2 rounded bg-[var(--color-bg-secondary)] text-xs">
				<div class="font-semibold mb-1">Changes:</div>
				<div class="space-y-1">
					{#each diff as change}
						<div class="flex items-center gap-2">
							<span
								class="px-1 rounded {change.type === 'added' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : change.type === 'removed' ? 'bg-[var(--color-error)]/20 text-[var(--color-error)]' : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'}"
							>
								{change.type}
							</span>
							<span class="font-mono">{change.path}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<pre class="flex-1 p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs font-mono overflow-auto {validation.valid ? '' : 'border-[var(--color-error)]'}">{currentJson}</pre>
		{#if !validation.valid && validation.error}
			<div class="mt-2 p-2 rounded bg-[var(--color-error)]/10 text-xs text-[var(--color-error)]">
				{validation.error.message}
				{#if validation.error.line}
					<br />
					Line {validation.error.line}, Column {validation.error.column}
				{/if}
			</div>
		{/if}
		{#if selectedVariant && selectedVariant.warnings && selectedVariant.warnings.length > 0}
			<div class="mt-2 p-2 rounded bg-[var(--color-warning)]/10 text-xs text-[var(--color-warning)]">
				<div class="font-semibold mb-1">Warnings:</div>
				<ul class="list-disc list-inside">
					{#each selectedVariant.warnings as warning}
						<li>{warning}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/if}
</div>
