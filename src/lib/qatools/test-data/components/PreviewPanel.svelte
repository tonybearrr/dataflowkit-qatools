<script lang="ts">
	import type { FieldSchema, GeneratorResult } from '../types';
	import { CheckCircle2, XCircle, RefreshCw } from 'lucide-svelte';

	interface Props {
		result: GeneratorResult | null;
		schema: FieldSchema[];
		onRegenerate?: () => void;
	}

	let { result, schema, onRegenerate }: Props = $props();

	const previewRows = $derived(result ? result.rows.slice(0, 50) : []);
	const headers = $derived(schema.length > 0 ? schema.map((f) => f.name) : []);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold">Preview</h3>
		{#if result && onRegenerate}
			<button
				onclick={onRegenerate}
				class="px-3 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
			>
				<RefreshCw class="w-4 h-4" />
				Regenerate
			</button>
		{/if}
	</div>

	{#if result && result.warnings.length > 0}
		<div class="p-3 rounded border border-[var(--color-warning)] bg-[var(--color-warning)]/10">
			<div class="flex items-start gap-2">
				<XCircle class="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
				<div class="flex-1">
					<p class="text-sm font-medium text-[var(--color-warning)] mb-1">Validation Errors</p>
					<ul class="text-sm text-[var(--color-text-muted)] space-y-1">
						{#each result.warnings as warning}
							<li>• {warning}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}

	{#if result && result.rows.length > 0}
		<div class="rounded border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-[var(--color-bg-secondary)] sticky top-0">
						<tr>
							{#each headers as header}
								<th class="px-3 py-2 text-left font-semibold border-b border-[var(--color-border)]">
									{header}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each previewRows as row}
							<tr class="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
								{#each headers as header}
									<td class="px-3 py-2 font-mono text-xs">
										{#if row[header] === null}
											<span class="text-[var(--color-text-muted)] italic">null</span>
										{:else if row[header] === undefined}
											<span class="text-[var(--color-text-muted)] italic">undefined</span>
										{:else}
											{String(row[header])}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if result.rows.length > 50}
				<div class="px-3 py-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
					Showing first 50 of {result.rows.length} rows
				</div>
			{/if}
		</div>
	{:else if result && result.rows.length === 0}
		<div class="p-8 text-center border border-dashed border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">
			<p class="text-sm text-[var(--color-text-muted)]">No data generated. Check schema validation errors.</p>
		</div>
	{:else}
		<div class="p-8 text-center border border-dashed border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">
			<p class="text-sm text-[var(--color-text-muted)]">Add fields to schema and generate data to see preview.</p>
		</div>
	{/if}
</div>
