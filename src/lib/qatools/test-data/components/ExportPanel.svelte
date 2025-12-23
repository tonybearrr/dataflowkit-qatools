<script lang="ts">
	import type { GeneratorConfig, GeneratorResult } from '../types';
	import { toCSV, toJSON, downloadFile } from '../export';
	import { Copy, Download } from 'lucide-svelte';

	interface Props {
		config: GeneratorConfig;
		result: GeneratorResult | null;
		onConfigUpdate?: (config: Partial<GeneratorConfig>) => void;
	}

	let { config, result, onConfigUpdate }: Props = $props();

	function generateRandomSeed() {
		const seed = Math.random().toString(36).substring(2, 15);
		onConfigUpdate?.({ seed });
	}

	function copyToClipboard() {
		if (!result || result.rows.length === 0) return;
		
		const content = config.output === 'csv' 
			? toCSV(result.rows, config.includeHeaderRow)
			: toJSON(result.rows, config.arrayKey);
		
		navigator.clipboard.writeText(content);
	}

	function download() {
		if (!result || result.rows.length === 0) return;
		
		const content = config.output === 'csv' 
			? toCSV(result.rows, config.includeHeaderRow)
			: toJSON(result.rows, config.arrayKey);
		
		const extension = config.output === 'csv' ? 'csv' : 'json';
		const mime = config.output === 'csv' ? 'text/csv' : 'application/json';
		const filename = `test-data.${extension}`;
		
		downloadFile(filename, content, mime);
	}

	const canExport = $derived(result && result.rows.length > 0 && result.warnings.length === 0);
</script>

<div class="space-y-4">
	<h3 class="text-sm font-semibold">Export</h3>

	<div class="space-y-3">
		<div>
			<label class="block text-xs text-[var(--color-text-muted)] mb-1">Rows</label>
			<input
				type="number"
				min="1"
				max="50000"
				value={config.rows}
				oninput={(e) => onConfigUpdate?.({ rows: parseInt(e.currentTarget.value) || 1 })}
				class="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)]"
			/>
		</div>

		<div>
			<label class="block text-xs text-[var(--color-text-muted)] mb-1">Seed (empty = random)</label>
			<div class="flex gap-2">
				<input
					type="text"
					value={config.seed}
					oninput={(e) => onConfigUpdate?.({ seed: e.currentTarget.value })}
					placeholder="Leave empty for random"
					class="flex-1 px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)]"
				/>
				<button
					onclick={generateRandomSeed}
					class="px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-sm"
				>
					Random
				</button>
			</div>
		</div>

		<div>
			<label class="block text-xs text-[var(--color-text-muted)] mb-1">Format</label>
			<select
				value={config.output}
				onchange={(e) => onConfigUpdate?.({ output: e.currentTarget.value as 'json' | 'csv' })}
				class="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)]"
			>
				<option value="json">JSON</option>
				<option value="csv">CSV</option>
			</select>
		</div>

		{#if config.output === 'csv'}
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					checked={config.includeHeaderRow}
					onchange={(e) => onConfigUpdate?.({ includeHeaderRow: e.currentTarget.checked })}
					class="rounded"
				/>
				Include header row
			</label>
		{/if}

		{#if config.output === 'json'}
			<div>
				<label class="block text-xs text-[var(--color-text-muted)] mb-1">Array Key (optional)</label>
				<input
					type="text"
					value={config.arrayKey || ''}
					oninput={(e) => onConfigUpdate?.({ arrayKey: e.currentTarget.value || undefined })}
					placeholder="e.g., 'items' wraps array in object"
					class="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)]"
				/>
			</div>
		{/if}

		<div class="flex gap-2 pt-2">
			<button
				onclick={copyToClipboard}
				disabled={!canExport}
				class="flex-1 px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
			>
				<Copy class="w-4 h-4" />
				Copy
			</button>
			<button
				onclick={download}
				disabled={!canExport}
				class="flex-1 px-4 py-2 rounded bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
			>
				<Download class="w-4 h-4" />
				Download
			</button>
		</div>
	</div>

	<p class="text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
		Data is generated locally in your browser.
	</p>
</div>
