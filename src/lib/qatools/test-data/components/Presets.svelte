<script lang="ts">
	import { presets } from '../presets';
	import type { FieldSchema } from '../types';
	import { Database } from 'lucide-svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { locale, tStringReactive } from '$lib/i18n';

	interface Props {
		schema: FieldSchema[];
		onSelect?: (schema: FieldSchema[]) => void;
	}

	let { schema, onSelect }: Props = $props();

	let showConfirm = $state(false);
	let pendingPreset: typeof presets[0] | null = $state(null);

	function selectPreset(preset: typeof presets[0]) {
		if (schema.length > 0) {
			pendingPreset = preset;
			showConfirm = true;
		} else {
			onSelect?.(preset.schema);
		}
	}

	function handleConfirm() {
		if (pendingPreset) {
			onSelect?.(pendingPreset.schema);
			pendingPreset = null;
		}
		showConfirm = false;
	}

	function handleCancel() {
		pendingPreset = null;
		showConfirm = false;
	}
</script>

<div class="space-y-3">
	<h3 class="text-sm font-semibold">Presets</h3>
	<div class="grid grid-cols-2 gap-2">
		{#each presets as preset}
			<button
				onclick={() => selectPreset(preset)}
				class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
			>
				<div class="flex items-center gap-2 mb-1">
					<Database class="w-4 h-4 text-[var(--color-accent)]" />
					<span class="text-sm font-semibold">{preset.name}</span>
				</div>
				<p class="text-xs text-[var(--color-text-muted)]">{preset.description}</p>
			</button>
		{/each}
	</div>
</div>

<ConfirmDialog
	open={showConfirm}
	title={tStringReactive('testDataGenerator.confirmReplaceTitle', $locale)}
	message={tStringReactive('testDataGenerator.confirmReplaceMessage', $locale)}
	confirmLabel={tStringReactive('testDataGenerator.confirmContinue', $locale)}
	cancelLabel={tStringReactive('testDataGenerator.confirmCancel', $locale)}
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>
