<script lang="ts">
	import type { AuthIssue } from '../types';
	import type { Locale } from '$lib/i18n';
	import { tStringReactive } from '$lib/i18n';
	import { CircleAlert, TriangleAlert, Info } from 'lucide-svelte';

	let { 
		issues, 
		selectedIssueId, 
		onSelectIssue,
		locale
	}: { 
		issues: AuthIssue[];
		selectedIssueId: string | null;
		onSelectIssue: (id: string) => void;
		locale: Locale;
	} = $props();

	const getIcon = (level: AuthIssue['level']) => {
		switch (level) {
			case 'error': return CircleAlert;
			case 'warning': return TriangleAlert;
			default: return Info;
		}
	};

	const getColor = (level: AuthIssue['level']) => {
		switch (level) {
			case 'error': return 'text-red-400';
			case 'warning': return 'text-amber-400';
			default: return 'text-blue-400';
		}
	};
</script>

<div class="space-y-2">
	<h3 class="text-sm font-semibold mb-3">{tStringReactive('authDebugger.detectedIssues', locale)}</h3>
	{#each issues as issue (issue.id)}
		{@const Icon = getIcon(issue.level)}
		{@const iconColor = getColor(issue.level)}
		<button
			onclick={() => onSelectIssue(issue.id)}
			class="w-full text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors {selectedIssueId === issue.id ? 'ring-2 ring-[var(--color-accent)]' : ''}"
		>
			<div class="flex items-start gap-2">
				<Icon class="w-4 h-4 {iconColor} mt-0.5 flex-shrink-0" />
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1">
						<div class="text-sm font-medium text-[var(--color-text)]">
							{issue.title}
						</div>
						<span class="text-xs px-1.5 py-0.5 rounded uppercase font-medium {
							issue.source === 'request' ? 'bg-blue-500/10 text-blue-400' :
							issue.source === 'response' ? 'bg-green-500/10 text-green-400' :
							'bg-purple-500/10 text-purple-400'
						}">
							{issue.source}
						</span>
					</div>
					<p class="text-xs text-[var(--color-text-muted)] line-clamp-2">
						{issue.explanation}
					</p>
				</div>
			</div>
		</button>
	{/each}
</div>
