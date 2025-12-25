<script lang="ts">
	import type { ParsedHeader } from '../types';
	import { getCategoryColor, getCategoryBgColor, truncateValue } from '../utils';
	import { getHeaderInfo } from '../knowledgeBase';

	interface Props {
		header: ParsedHeader;
		selected?: boolean;
		onSelect?: (header: ParsedHeader) => void;
	}

	let { header, selected = false, onSelect }: Props = $props();

	const headerInfo = $derived(getHeaderInfo(header.normalizedName));
	const category = $derived(headerInfo?.category || 'other');
</script>

<button
	type="button"
	data-header-row={header.normalizedName}
	onclick={() => onSelect?.(header)}
	class="w-full p-3 rounded-lg border transition-all text-left {selected
		? 'border-[var(--color-accent)] bg-[var(--color-bg-tertiary)]'
		: 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)]'}"
>
	<div class="flex items-start gap-3">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<h3 class="font-semibold font-mono text-sm">{header.name}</h3>
				{#if header.duplicateCount > 1}
					<span
						class="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						×{header.duplicateCount}
					</span>
				{/if}
			</div>
			<p class="text-xs text-[var(--color-text-muted)] truncate">
				{truncateValue(header.value, 50)}
			</p>
		</div>
		{#if headerInfo}
			<span
				class="text-xs px-2 py-1 rounded {getCategoryBgColor(category)} {getCategoryColor(category)}"
			>
				{category}
			</span>
		{/if}
	</div>
</button>

