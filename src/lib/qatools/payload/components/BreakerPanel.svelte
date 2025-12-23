<script lang="ts">
	import type { BreakerRule, PayloadVariant, BreakerMode, Constraints } from '../types';
	import { generatePresetRules } from '../breaker';
	import { generateId } from '../treeOps';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';

	interface Props {
		basePayload: any;
		variants: PayloadVariant[];
		selectedVariantId?: string;
		metadata?: Record<string, { required?: boolean; constraints?: Constraints }>;
		onVariantSelect?: (variantId: string) => void;
		onVariantCreate?: (variant: PayloadVariant) => void;
		onVariantDelete?: (variantId: string) => void;
		onVariantUpdate?: (variant: PayloadVariant) => void;
		onRegenerate?: (variant: PayloadVariant) => void;
	}

	let {
		basePayload,
		variants,
		selectedVariantId,
		metadata,
		onVariantSelect,
		onVariantCreate,
		onVariantDelete,
		onVariantUpdate,
		onRegenerate
	}: Props = $props();

	let newVariantName = $state('');
	let selectedPath = $state('');
	let selectedMode = $state<BreakerMode>('remove');

	function createVariant() {
		if (!newVariantName.trim()) return;

		const variant: PayloadVariant = {
			id: generateId(),
			name: newVariantName,
			baseId: 'base',
			rules: []
		};

		onVariantCreate?.(variant);
		newVariantName = '';
	}

	function createPresetVariant(preset: Parameters<typeof generatePresetRules>[1]) {
		const rules = generatePresetRules(basePayload, preset, metadata);
		const variant: PayloadVariant = {
			id: generateId(),
			name: preset.charAt(0).toUpperCase() + preset.slice(1).replace(/([A-Z])/g, ' $1'),
			baseId: 'base',
			rules
		};
		onVariantCreate?.(variant);
	}

	function addRule(variantId: string) {
		if (!selectedPath) return;

		const variant = variants.find((v) => v.id === variantId);
		if (!variant) return;

		const rule: BreakerRule = {
			id: generateId(),
			path: selectedPath,
			mode: selectedMode
		};

		variant.rules.push(rule);
		onVariantUpdate?.(variant);
		selectedPath = '';
	}

	function removeRule(variantId: string, ruleId: string) {
		const variant = variants.find((v) => v.id === variantId);
		if (!variant) return;

		variant.rules = variant.rules.filter((r) => r.id !== ruleId);
		onVariantUpdate?.(variant);
	}
</script>

<div class="space-y-4">
	<div>
		<h3 class="text-sm font-semibold mb-2">Variants</h3>
		<div class="space-y-2">
			<div
				class="p-2 rounded border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-secondary)] {selectedVariantId === 'base' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''}"
				onclick={() => onVariantSelect?.('base')}
			>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Base</span>
					<span class="text-xs text-[var(--color-text-muted)]">Original</span>
				</div>
			</div>

			{#each variants as variant}
				<div
					class="p-2 rounded border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-secondary)] {selectedVariantId === variant.id ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''}"
					onclick={() => onVariantSelect?.(variant.id)}
				>
					<div class="flex items-center justify-between mb-1">
						<span class="text-sm font-medium">{variant.name}</span>
						<div class="flex items-center gap-2">
							<button
								onclick={(e) => {
									e.stopPropagation();
									onRegenerate?.(variant);
								}}
								class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
								title="Regenerate"
							>
								<RefreshCw class="w-3 h-3" />
							</button>
							<button
								onclick={(e) => {
									e.stopPropagation();
									onVariantDelete?.(variant.id);
								}}
								class="p-1 hover:bg-[var(--color-error)]/20 hover:text-[var(--color-error)] rounded"
								title="Delete"
							>
								<Trash2 class="w-3 h-3" />
							</button>
						</div>
					</div>
					<div class="text-xs text-[var(--color-text-muted)]">
						{variant.rules.length} rule{variant.rules.length !== 1 ? 's' : ''}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div>
		<h3 class="text-sm font-semibold mb-2">Presets</h3>
		<div class="grid grid-cols-2 gap-2">
			<button
				onclick={() => createPresetVariant('missingRequired')}
				class="px-3 py-2 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-left"
			>
				Missing Required
			</button>
			<button
				onclick={() => createPresetVariant('wrongTypes')}
				class="px-3 py-2 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-left"
			>
				Wrong Types
			</button>
			<button
				onclick={() => createPresetVariant('nullsEverywhere')}
				class="px-3 py-2 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-left"
			>
				Nulls Everywhere
			</button>
			<button
				onclick={() => createPresetVariant('edgeValues')}
				class="px-3 py-2 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-left"
			>
				Edge Values
			</button>
			<button
				onclick={() => createPresetVariant('mixedErrors')}
				class="px-3 py-2 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-left col-span-2"
			>
				Mixed Errors
			</button>
		</div>
	</div>

	<div>
		<h3 class="text-sm font-semibold mb-2">Create Variant</h3>
		<div class="space-y-2">
			<input
				type="text"
				bind:value={newVariantName}
				placeholder="Variant name"
				class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
				onkeydown={(e) => e.key === 'Enter' && createVariant()}
			/>
			<button
				onclick={createVariant}
				class="w-full px-3 py-2 text-sm rounded bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white flex items-center justify-center gap-2"
			>
				<Plus class="w-4 h-4" />
				Create
			</button>
		</div>
	</div>

	{#if selectedVariantId && selectedVariantId !== 'base'}
		{@const variant = variants.find((v) => v.id === selectedVariantId)}
		{#if variant}
			<div>
				<h3 class="text-sm font-semibold mb-2">Add Rule</h3>
				<div class="space-y-2">
					<input
						type="text"
						bind:value={selectedPath}
						placeholder="Path (e.g., user.email)"
						class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
					/>
					<select
						bind:value={selectedMode}
						class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
					>
						<option value="remove">Remove</option>
						<option value="setNull">Set Null</option>
						<option value="wrongType">Wrong Type</option>
						<option value="emptyString">Empty String</option>
						<option value="tooLong">Too Long</option>
						<option value="outOfRange">Out of Range</option>
						<option value="invalidEnum">Invalid Enum</option>
					</select>
					<button
						onclick={() => addRule(variant.id)}
						class="w-full px-3 py-2 text-sm rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
					>
						Add Rule
					</button>
				</div>

				<div class="mt-4">
					<h4 class="text-xs font-semibold mb-2">Rules ({variant.rules.length})</h4>
					<div class="space-y-1">
						{#each variant.rules as rule}
							<div class="flex items-center justify-between p-2 rounded bg-[var(--color-bg-secondary)]">
								<div class="text-xs">
									<div class="font-medium">{rule.path}</div>
									<div class="text-[var(--color-text-muted)]">{rule.mode}</div>
								</div>
								<button
									onclick={() => removeRule(variant.id, rule.id)}
									class="p-1 hover:bg-[var(--color-error)]/20 hover:text-[var(--color-error)] rounded"
								>
									<Trash2 class="w-3 h-3" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
