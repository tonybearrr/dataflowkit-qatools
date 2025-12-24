<script lang="ts">
	import type { StatusCode } from '$lib/tools/status-code-reference';
	import { getRelatedStatusCodes } from '$lib/tools/status-code-reference';
	import { copyToClipboard } from '../utils';
	import { getCategoryBgColor, getCategoryColor } from '../utils';
	import { Copy, Check } from 'lucide-svelte';

	interface Props {
		code: StatusCode | null;
		locale: (key: string) => string;
	}

	let { code, locale }: Props = $props();

	let copiedJson = $state(false);
	let copiedTitle = $state(false);

	async function handleCopyJson() {
		if (!code) return;
		const json = JSON.stringify(code.returnTemplate, null, 2);
		const success = await copyToClipboard(json);
		if (success) {
			copiedJson = true;
			setTimeout(() => (copiedJson = false), 2000);
		}
	}

	async function handleCopyTitle() {
		if (!code) return;
		const title = `${code.code} ${code.phrase}`;
		const success = await copyToClipboard(title);
		if (success) {
			copiedTitle = true;
			setTimeout(() => (copiedTitle = false), 2000);
		}
	}
</script>

{#if code}
	<div class="sticky top-4">
		<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
			<!-- Header -->
			<div class="mb-6">
				<div class="flex items-center gap-3 mb-3">
					<span class="text-4xl font-mono font-bold {getCategoryColor(code.category)}">
						{code.code}
					</span>
					<div class="flex-1">
						<h2 class="text-2xl font-bold mb-1">{code.phrase}</h2>
						<span
							class="inline-block px-2 py-1 text-xs font-semibold rounded {getCategoryBgColor(
								code.category
							)} {getCategoryColor(code.category)}"
						>
							{locale(`statusCodeReference.categoryLabel.${code.label}`)}
						</span>
					</div>
				</div>
				<p class="text-sm text-[var(--color-text-muted)]">{locale(code.summaryKey)}</p>
			</div>

			<!-- When to use -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold mb-2">
					{locale('statusCodeReference.whenToUse')}
				</h3>
				<ul class="space-y-1.5">
					{#each code.whenToUseKeys as key}
						<li class="text-sm text-[var(--color-text-muted)] flex items-start gap-2">
							<span class="text-[var(--color-accent)] mt-1">•</span>
							<span>{locale(key)}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Common causes -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold mb-2">
					{locale('statusCodeReference.commonCauses')}
				</h3>
				<ul class="space-y-1.5">
					{#each code.commonCausesKeys as key}
						<li class="text-sm text-[var(--color-text-muted)] flex items-start gap-2">
							<span class="text-[var(--color-accent)] mt-1">•</span>
							<span>{locale(key)}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- What to return -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold mb-2">
					{locale('statusCodeReference.whatToReturn')}
				</h3>
				<div class="relative">
					<pre
						class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-xs font-mono overflow-x-auto"
					><code>{JSON.stringify(code.returnTemplate, null, 2)}</code></pre>
					<button
						type="button"
						onclick={handleCopyJson}
						class="absolute top-2 right-2 p-1.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
						title={locale('statusCodeReference.copyJson')}
					>
						{#if copiedJson}
							<Check class="w-4 h-4 text-green-400" />
						{:else}
							<Copy class="w-4 h-4" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Testing checklist -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold mb-2">
					{locale('statusCodeReference.testingChecklist')}
				</h3>
				<ul class="space-y-1.5">
					{#each code.checklistKeys as key}
						<li class="text-sm text-[var(--color-text-muted)] flex items-start gap-2">
							<span class="text-[var(--color-accent)] mt-1">•</span>
							<span>{locale(key)}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Quick actions -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold mb-2">Quick Actions</h3>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={handleCopyTitle}
						class="px-3 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] transition-colors flex items-center gap-2"
					>
						{#if copiedTitle}
							<Check class="w-4 h-4 text-green-400" />
							<span>{locale('statusCodeReference.copied')}</span>
						{:else}
							<Copy class="w-4 h-4" />
							<span>{locale('statusCodeReference.copyTitle')}</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Related codes -->
			{#if code.related.length > 0}
				<div>
					<h3 class="text-sm font-semibold mb-2">
						{locale('statusCodeReference.relatedCodes')}
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each getRelatedStatusCodes(code.code) as related}
							<a
								href="#{related.code}"
								class="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] transition-colors {getCategoryColor(
									related.category
								)}"
							>
								{related.code} {related.phrase}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="sticky top-4 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center">
		<p class="text-sm text-[var(--color-text-muted)]">
			Select a status code to view details
		</p>
	</div>
{/if}

