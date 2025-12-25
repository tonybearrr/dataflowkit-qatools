<script lang="ts">
	import type { HeaderIssue } from '../issues';
	import { TriangleAlert, Info, CircleAlert, X } from 'lucide-svelte';

	interface Props {
		issues: HeaderIssue[];
		locale: (key: string) => string;
		onSelectHeader?: (normalizedName: string) => void;
	}

	let { issues, locale, onSelectHeader }: Props = $props();

	let expandedIssues = $state<Set<number>>(new Set());
	let showOnlyErrors = $state(false);
	let isCollapsed = $state(false);

	function toggleIssue(index: number) {
		const newSet = new Set(expandedIssues);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		expandedIssues = newSet;
	}

	function handleIssueClick(issue: HeaderIssue) {
		if (issue.related.length > 0 && onSelectHeader) {
			onSelectHeader(issue.related[0].headerName);
		}
	}

	function handleHeaderChipClick(e: MouseEvent, headerName: string) {
		e.stopPropagation();
		if (onSelectHeader) {
			onSelectHeader(headerName);
		}
	}

	const filteredIssues = $derived(
		showOnlyErrors ? issues.filter((i) => i.type === 'error') : issues
	);

	const errorCount = $derived(issues.filter((i) => i.type === 'error').length);
	const warningCount = $derived(issues.filter((i) => i.type === 'warn').length);
	const infoCount = $derived(issues.filter((i) => i.type === 'info').length);
</script>

{#if issues.length > 0 && !isCollapsed}
	<div class="mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
		<div class="flex items-center gap-2 mb-4">
			<TriangleAlert class="w-5 h-5 text-yellow-400" />
			<h3 class="font-semibold">{locale('headersInspector.issues.detectedIssues')} ({issues.length})</h3>
			<div class="flex gap-2 ml-auto">
				{#if errorCount > 0}
					<span class="text-xs px-2 py-1 rounded bg-red-500/10" style="color: #ff3047;">
						{errorCount} {locale('headersInspector.issues.errors')}
					</span>
				{/if}
				{#if warningCount > 0}
					<span class="text-xs px-2 py-1 rounded bg-yellow-500/10" style="color: #bc7602;">
						{warningCount} {locale('headersInspector.issues.warnings')}
					</span>
				{/if}
				{#if infoCount > 0}
					<span class="text-xs px-2 py-1 rounded bg-blue-500/10" style="color: #084e96;">
						{infoCount} {locale('headersInspector.issues.info')}
					</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (isCollapsed = true)}
				class="ml-2 p-1 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
				title={locale('headersInspector.issues.hideIssues')}
			>
				<X class="w-4 h-4" />
			</button>
		</div>

		<div class="mb-3">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={showOnlyErrors}
					class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
				/>
				<span class="text-sm text-[var(--color-text-muted)]">{locale('headersInspector.issues.showOnlyErrors')}</span>
			</label>
		</div>

		<div class="space-y-2">
			{#each filteredIssues as issue, index}
				<div
					role="button"
					tabindex="0"
					onclick={() => handleIssueClick(issue)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleIssueClick(issue);
						}
					}}
					class="w-full text-left p-3 rounded border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] {issue.type === 'error'
						? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
						: issue.type === 'warn'
							? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15'
							: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15'}"
					style={issue.type === 'error' ? 'color: #ff3047;' : issue.type === 'warn' ? 'color: #bc7602;' : issue.type === 'info' ? 'color: #084e96;' : ''}
				>
					<div class="flex items-start gap-2">
						{#if issue.type === 'error'}
							<CircleAlert class="w-4 h-4 mt-0.5 flex-shrink-0" style="color: #ff3047;" />
						{:else if issue.type === 'warn'}
							<TriangleAlert class="w-4 h-4 mt-0.5 flex-shrink-0" style="color: #bc7602;" />
						{:else}
							<Info class="w-4 h-4 mt-0.5 flex-shrink-0" style="color: #084e96;" />
						{/if}
						<div class="flex-1 min-w-0">
							<p class="font-medium text-sm mb-1">{issue.title}</p>
							<p class="text-xs opacity-80 mb-2">{issue.messageKey ? locale(issue.messageKey) : issue.message}</p>
							{#if expandedIssues.has(index) && issue.learnMore}
								<p class="text-xs opacity-70 mt-1">{issue.learnMore}</p>
							{/if}
							{#if issue.related && issue.related.length > 0}
								<div class="flex flex-wrap gap-1 mt-2">
									{#each issue.related as { headerName }}
										<button
											type="button"
											onclick={(e) => handleHeaderChipClick(e, headerName)}
											class="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] font-mono hover:bg-[var(--color-bg)] transition-colors"
										>
											{headerName}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						{#if issue.learnMore}
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									toggleIssue(index);
								}}
								class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
							>
								{expandedIssues.has(index) ? locale('headersInspector.issues.less') : locale('headersInspector.issues.more')}
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else if issues.length > 0 && isCollapsed}
	<button
		type="button"
		onclick={() => (isCollapsed = false)}
		class="mb-6 w-full p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-left"
	>
		<div class="flex items-center gap-2">
			<TriangleAlert class="w-5 h-5 text-yellow-400" />
			<span class="font-semibold">{locale('headersInspector.issues.showDetectedIssues')} ({issues.length})</span>
		</div>
	</button>
{/if}
