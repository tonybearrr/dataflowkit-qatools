<script lang="ts">
	import type { AuthIssue } from '../types';
	import { Copy, Check } from 'lucide-svelte';

	let { issue }: { issue: AuthIssue | null } = $props();

	let copied = $state(false);

	function copyText(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	function copyFix() {
		if (!issue) return;
		const fixText = issue.fix.map((f, i) => `${i + 1}. ${f}`).join('\n');
		copyText(fixText);
	}
</script>

{#if issue}
	<div class="space-y-4">
		<div>
			<div class="flex items-center gap-2 mb-2">
				<h3 class="text-lg font-semibold">{issue.title}</h3>
				<span class="text-xs px-2 py-1 rounded uppercase font-medium {
					issue.source === 'request' ? 'bg-blue-500/10 text-blue-400' :
					issue.source === 'response' ? 'bg-green-500/10 text-green-400' :
					'bg-purple-500/10 text-purple-400'
				}">
					{issue.source}
				</span>
			</div>
			<p class="text-sm text-[var(--color-text-muted)]">{issue.explanation}</p>
		</div>

		{#if issue.related.length > 0}
			<div>
				<h4 class="text-sm font-semibold mb-2">Related:</h4>
				<div class="flex flex-wrap gap-2">
					{#each issue.related as rel}
						<span class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
							{rel.kind}{rel.key ? `: ${rel.key}` : ''}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<div>
			<div class="flex items-center justify-between mb-2">
				<h4 class="text-sm font-semibold">How to Fix:</h4>
				<button
					onclick={copyFix}
					class="p-1 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
					title="Copy fix steps"
				>
					{#if copied}
						<Check class="w-4 h-4 text-green-400" />
					{:else}
						<Copy class="w-4 h-4 text-[var(--color-text-muted)]" />
					{/if}
				</button>
			</div>
			<ol class="list-decimal list-inside space-y-1 text-sm text-[var(--color-text)]">
				{#each issue.fix as step}
					<li>{step}</li>
				{/each}
			</ol>
		</div>

		{#if issue.backendTip}
			<div class="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
				<h4 class="text-sm font-semibold text-blue-400 mb-1">Backend Tip:</h4>
				<p class="text-sm text-[var(--color-text)]">{issue.backendTip}</p>
			</div>
		{/if}
	</div>
{:else}
	<div class="text-center py-8 text-[var(--color-text-muted)]">
		<p class="text-sm">Select an issue to view details</p>
	</div>
{/if}