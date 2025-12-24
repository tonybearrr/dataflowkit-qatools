<script lang="ts">
	import type { StatusCode } from '$lib/tools/status-code-reference';
	import { getCategoryColor } from '../utils';

	interface Props {
		code: StatusCode;
		selected?: boolean;
		onSelect?: (code: StatusCode) => void;
		locale: (key: string) => string;
	}

	let { code, selected = false, onSelect, locale }: Props = $props();
</script>

<button
	type="button"
	data-code={code.code}
	onclick={() => onSelect?.(code)}
	class="w-full p-4 rounded-lg border transition-all text-left {selected
		? 'border-[var(--color-accent)] bg-[var(--color-bg-tertiary)]'
		: 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)]'}"
>
	<div class="flex items-center gap-3 mb-2">
		<span class="text-2xl font-mono font-bold {getCategoryColor(code.category)}">{code.code}</span>
		<div class="flex-1 min-w-0">
			<h3 class="font-semibold truncate">{code.phrase}</h3>
			<span class="text-xs text-[var(--color-text-muted)]">{code.category}</span>
		</div>
	</div>
	<p class="text-sm text-[var(--color-text-muted)] line-clamp-2">
		{locale(code.summaryKey)}
	</p>
</button>

