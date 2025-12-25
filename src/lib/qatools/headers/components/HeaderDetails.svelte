<script lang="ts">
	import type { ParsedHeader } from '../types';
	import { getHeaderInfo } from '../knowledgeBase';
	import { copyToClipboard, getCategoryColor, getCategoryBgColor } from '../utils';
	import { getHeaderHint } from '../issues';
	import { Copy, Check, Lightbulb } from 'lucide-svelte';

	interface Props {
		header: ParsedHeader | null;
		allHeaders: ParsedHeader[];
		mode: 'request' | 'response';
		locale: (key: string) => string;
	}

	let { header, allHeaders, mode, locale }: Props = $props();

	let copiedName = $state(false);
	let copiedValue = $state(false);
	let copiedFull = $state(false);

	async function handleCopyName() {
		if (!header) return;
		const success = await copyToClipboard(header.name);
		if (success) {
			copiedName = true;
			setTimeout(() => (copiedName = false), 2000);
		}
	}

	async function handleCopyValue() {
		if (!header) return;
		const success = await copyToClipboard(header.value);
		if (success) {
			copiedValue = true;
			setTimeout(() => (copiedValue = false), 2000);
		}
	}

	async function handleCopyFull() {
		if (!header) return;
		const full = `${header.name}: ${header.value}`;
		const success = await copyToClipboard(full);
		if (success) {
			copiedFull = true;
			setTimeout(() => (copiedFull = false), 2000);
		}
	}

	const headerInfo = $derived(header ? getHeaderInfo(header.normalizedName) : null);
	const category = $derived(headerInfo?.category || 'other');
	const hint = $derived(header ? getHeaderHint(header, allHeaders, mode) : null);
</script>

{#if header}
	<div class="sticky top-20">
		<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
			<!-- Header -->
			<div class="mb-6">
				<div class="flex items-center gap-3 mb-3">
					<h2 class="text-xl font-bold font-mono">{header.name}</h2>
					{#if headerInfo}
						<span
							class="text-xs px-2 py-1 rounded {getCategoryBgColor(category)} {getCategoryColor(category)}"
						>
							{category}
						</span>
					{/if}
					{#if header.duplicateCount > 1}
						<span
							class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
						>
							{header.duplicateCount} {locale('headersInspector.details.duplicates')}
						</span>
					{/if}
				</div>
				<div class="p-3 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm break-all">
					{header.value}
				</div>
			</div>

			{#if headerInfo}
				<!-- Description -->
				<div class="mb-6">
					<h3 class="text-sm font-semibold mb-2">{locale('headersInspector.details.whatItDoes')}</h3>
					<p class="text-sm text-[var(--color-text-muted)]">
						{locale(headerInfo.descriptionKey)}
					</p>
				</div>

				<!-- Recommendation -->
				{#if hint}
					<div class="mb-6 p-3 rounded-lg border {hint.tone === 'warn'
						? 'border-yellow-500/20 bg-yellow-500/10'
						: 'border-blue-500/20 bg-blue-500/10'}">
						<p class="text-sm flex items-start gap-2">
							<Lightbulb class="w-4 h-4 mt-0.5 flex-shrink-0 {hint.tone === 'warn' ? 'text-yellow-400' : 'text-blue-400'}" />
							<span class="flex-1">
								<span class="font-medium">{locale('headersInspector.details.recommendation')}</span> {hint.textKey ? locale(hint.textKey) : hint.text}
							</span>
						</p>
					</div>
				{/if}

				<!-- When to use -->
				{#if headerInfo.whenToUseKeys.length > 0}
					<div class="mb-6">
						<h3 class="text-sm font-semibold mb-2">{locale('headersInspector.details.whenToUse')}</h3>
						<ul class="list-disc list-inside space-y-1 text-sm text-[var(--color-text-muted)]">
							{#each headerInfo.whenToUseKeys as key}
								<li>{locale(key)}</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Common mistakes -->
				{#if headerInfo.commonMistakesKeys.length > 0}
					<div class="mb-6">
						<h3 class="text-sm font-semibold mb-2">
							{locale('headersInspector.details.commonMistakes')}
						</h3>
						<ul class="list-disc list-inside space-y-1 text-sm text-[var(--color-text-muted)]">
							{#each headerInfo.commonMistakesKeys as key}
								<li>{locale(key)}</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Security notes -->
				{#if headerInfo.securityNotesKey}
					<div class="mb-6">
						<h3 class="text-sm font-semibold mb-2">{locale('headersInspector.details.securityNotes')}</h3>
						<p class="text-sm text-[var(--color-text-muted)]">
							{locale(headerInfo.securityNotesKey)}
						</p>
					</div>
				{/if}
			{:else}
				<div class="mb-6">
					<p class="text-sm text-[var(--color-text-muted)]">
						{locale('headersInspector.details.noInfo')}
					</p>
				</div>
			{/if}

			<!-- Quick actions -->
			<div class="border-t border-[var(--color-border)] pt-4">
				<h3 class="text-sm font-semibold mb-3">{locale('headersInspector.details.quickActions')}</h3>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={handleCopyName}
						class="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg)] transition-colors text-sm"
					>
						{#if copiedName}
							<Check class="w-4 h-4 text-green-400" />
						{:else}
							<Copy class="w-4 h-4" />
						{/if}
						{locale('headersInspector.details.copyName')}
					</button>
					<button
						type="button"
						onclick={handleCopyValue}
						class="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg)] transition-colors text-sm"
					>
						{#if copiedValue}
							<Check class="w-4 h-4 text-green-400" />
						{:else}
							<Copy class="w-4 h-4" />
						{/if}
						{locale('headersInspector.details.copyValue')}
					</button>
					<button
						type="button"
						onclick={handleCopyFull}
						class="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg)] transition-colors text-sm"
					>
						{#if copiedFull}
							<Check class="w-4 h-4 text-green-400" />
						{:else}
							<Copy class="w-4 h-4" />
						{/if}
						{locale('headersInspector.details.copyFull')}
					</button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="sticky top-20">
		<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
			<p class="text-sm text-[var(--color-text-muted)] text-center">
				{locale('headersInspector.details.selectHeader')}
			</p>
		</div>
	</div>
{/if}

