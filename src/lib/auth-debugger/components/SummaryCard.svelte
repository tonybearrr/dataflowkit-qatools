<script lang="ts">
	import type { AuthAnalysis } from '../types';
	import { CircleAlert, TriangleAlert, Info } from 'lucide-svelte';

	let { analysis }: { analysis: AuthAnalysis } = $props();

	const severityConfig = {
		error: { icon: CircleAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400' },
		warning: { icon: TriangleAlert, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-400' },
		info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400' }
	};

	const config = $derived(severityConfig[analysis.severity]);
	const Icon = $derived(config.icon);
</script>

<div class="p-4 rounded-lg border {config.border} {config.bg}">
	<div class="flex items-start gap-3">
		<Icon class="w-5 h-5 {config.color} mt-0.5 flex-shrink-0" />
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-2">
				<span class="text-sm font-semibold {config.color}">
					{analysis.severity.toUpperCase()}
				</span>
				<span class="text-xs text-[var(--color-text-muted)]">
					({analysis.issues.length} issue{analysis.issues.length !== 1 ? 's' : ''})
				</span>
			</div>
			<p class="text-sm text-[var(--color-text)]">
				{analysis.summary}
			</p>
		</div>
	</div>
</div>

