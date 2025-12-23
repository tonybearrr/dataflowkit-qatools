<script lang="ts">
	import type { FieldSchema, FieldOptions } from '../types';
	import { FieldType } from '../types';
	import { ChevronDown, ChevronUp, Copy, Trash2, ChevronRight } from 'lucide-svelte';

	interface Props {
		field: FieldSchema;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onupdate?: (updates: Partial<FieldSchema>) => void;
		ondelete?: () => void;
		onduplicate?: () => void;
		onmoveup?: () => void;
		onmovedown?: () => void;
	}

	let { field, canMoveUp, canMoveDown, onupdate, ondelete, onduplicate, onmoveup, onmovedown }: Props = $props();

	let expanded = $state(false);

	function updateField(updates: Partial<FieldSchema>) {
		onupdate?.(updates);
	}

	function updateOptions(options: FieldOptions) {
		updateField({ options });
	}
</script>

<div class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg)]">
	<div class="flex items-center gap-2 mb-2">
		<button
			onclick={() => (expanded = !expanded)}
			class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded transition-colors"
		>
			<ChevronRight class="w-4 h-4 transition-transform {expanded ? 'rotate-90' : ''}" />
		</button>
		<input
			type="text"
			value={field.name}
			oninput={(e) => updateField({ name: e.currentTarget.value })}
			class="flex-1 px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
			placeholder="Field name"
		/>
		<select
			value={field.type}
			onchange={(e) => updateField({ type: e.currentTarget.value as FieldType, options: undefined })}
			class="px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
		>
			{#each Object.values(FieldType) as type}
				<option value={type}>{type}</option>
			{/each}
		</select>
		<label class="flex items-center gap-1 text-xs">
			<input
				type="checkbox"
				checked={field.required}
				onchange={(e) => updateField({ required: e.currentTarget.checked })}
				class="rounded"
			/>
			Required
		</label>
		<button
			onclick={() => onmoveup?.()}
			disabled={!canMoveUp}
			class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded transition-colors disabled:opacity-50"
		>
			<ChevronUp class="w-4 h-4" />
		</button>
		<button
			onclick={() => onmovedown?.()}
			disabled={!canMoveDown}
			class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded transition-colors disabled:opacity-50"
		>
			<ChevronDown class="w-4 h-4" />
		</button>
		<button
			onclick={() => onduplicate?.()}
			class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded transition-colors"
		>
			<Copy class="w-4 h-4" />
		</button>
		<button
			onclick={() => ondelete?.()}
			class="p-1 hover:bg-[var(--color-error)]/10 rounded transition-colors"
		>
			<Trash2 class="w-4 h-4 text-[var(--color-error)]" />
		</button>
	</div>

	{#if expanded}
		<div class="mt-3 pt-3 border-t border-[var(--color-border)] space-y-3">
			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					checked={field.nullable}
					onchange={(e) => updateField({ nullable: e.currentTarget.checked })}
					class="rounded"
				/>
				Nullable
			</label>

			{#if field.nullable}
				<div>
					<label class="block text-xs text-[var(--color-text-muted)] mb-1">
						Null Chance: {(field.nullChance * 100).toFixed(0)}%
					</label>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={field.nullChance}
						oninput={(e) => updateField({ nullChance: parseFloat(e.currentTarget.value) })}
						class="w-full"
					/>
				</div>
			{/if}

			{#if field.type === FieldType.String}
				<div class="space-y-2">
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-xs text-[var(--color-text-muted)] mb-1">Min Length</label>
							<input
								type="number"
								value={(field.options as any)?.minLen || 5}
								oninput={(e) => updateOptions({ ...(field.options || {}), minLen: parseInt(e.currentTarget.value) || 0 })}
								class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
							/>
						</div>
						<div>
							<label class="block text-xs text-[var(--color-text-muted)] mb-1">Max Length</label>
							<input
								type="number"
								value={(field.options as any)?.maxLen || 20}
								oninput={(e) => updateOptions({ ...(field.options || {}), maxLen: parseInt(e.currentTarget.value) || 0 })}
								class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
							/>
						</div>
					</div>
				</div>
			{/if}

			{#if field.type === FieldType.Number}
				<div class="space-y-2">
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-xs text-[var(--color-text-muted)] mb-1">Min</label>
							<input
								type="number"
								value={(field.options as any)?.min ?? 0}
								oninput={(e) => updateOptions({ ...(field.options || {}), min: parseFloat(e.currentTarget.value) || 0 })}
								class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
							/>
						</div>
						<div>
							<label class="block text-xs text-[var(--color-text-muted)] mb-1">Max</label>
							<input
								type="number"
								value={(field.options as any)?.max ?? 1000}
								oninput={(e) => updateOptions({ ...(field.options || {}), max: parseFloat(e.currentTarget.value) || 0 })}
								class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
							/>
						</div>
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={(field.options as any)?.integerOnly || false}
							onchange={(e) => updateOptions({ ...(field.options || {}), integerOnly: e.currentTarget.checked })}
							class="rounded"
						/>
						Integer only
					</label>
				</div>
			{/if}

			{#if field.type === FieldType.Date}
				<div class="space-y-2">
					<div>
						<label class="block text-xs text-[var(--color-text-muted)] mb-1">From</label>
						<input
							type="date"
							value={(field.options as any)?.from ? new Date((field.options as any).from).toISOString().split('T')[0] : ''}
							oninput={(e) => updateOptions({ ...(field.options || {}), from: e.currentTarget.value })}
							class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						/>
					</div>
					<div>
						<label class="block text-xs text-[var(--color-text-muted)] mb-1">To</label>
						<input
							type="date"
							value={(field.options as any)?.to ? new Date((field.options as any).to).toISOString().split('T')[0] : ''}
							oninput={(e) => updateOptions({ ...(field.options || {}), to: e.currentTarget.value })}
							class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						/>
					</div>
					<div>
						<label class="block text-xs text-[var(--color-text-muted)] mb-1">Format</label>
						<select
							value={(field.options as any)?.format || 'iso'}
							onchange={(e) => updateOptions({ ...(field.options || {}), format: e.currentTarget.value })}
							class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						>
							<option value="iso">ISO</option>
							<option value="unix">Unix</option>
							<option value="ms">Milliseconds</option>
						</select>
					</div>
				</div>
			{/if}

			{#if field.type === FieldType.Enum}
				<div>
					<label class="block text-xs text-[var(--color-text-muted)] mb-1">Values (comma-separated)</label>
					<input
						type="text"
						value={((field.options as any)?.values || []).join(', ')}
						oninput={(e) => {
							const values = e.currentTarget.value.split(',').map((v) => v.trim()).filter(Boolean);
							updateOptions({ values });
						}}
						class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						placeholder="value1, value2, value3"
					/>
				</div>
			{/if}

			{#if field.type === FieldType.Email}
				<div>
					<label class="block text-xs text-[var(--color-text-muted)] mb-1">Domains (comma-separated, optional)</label>
					<input
						type="text"
						value={((field.options as any)?.domains || []).join(', ')}
						oninput={(e) => {
							const domains = e.currentTarget.value.split(',').map((v) => v.trim()).filter(Boolean);
							updateOptions({ domains });
						}}
						class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						placeholder="example.com, test.com"
					/>
				</div>
			{/if}

			{#if field.type === FieldType.Phone}
				<div class="space-y-2">
					<div>
						<label class="block text-xs text-[var(--color-text-muted)] mb-1">Country</label>
						<input
							type="text"
							value={(field.options as any)?.country || 'UA'}
							oninput={(e) => updateOptions({ ...(field.options || {}), country: e.currentTarget.value })}
							class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						/>
					</div>
					<div>
						<label class="block text-xs text-[var(--color-text-muted)] mb-1">Format</label>
						<select
							value={(field.options as any)?.format || 'local'}
							onchange={(e) => updateOptions({ ...(field.options || {}), format: e.currentTarget.value as 'e164' | 'local' })}
							class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						>
							<option value="local">Local</option>
							<option value="e164">E.164</option>
						</select>
					</div>
				</div>
			{/if}

			{#if field.type === FieldType.Name}
				<div>
					<label class="block text-xs text-[var(--color-text-muted)] mb-1">Style</label>
						<select
							value={(field.options as any)?.style || 'full'}
							onchange={(e) => updateOptions({ ...(field.options || {}), style: e.currentTarget.value as 'full' | 'first' | 'last' })}
							class="w-full px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
						>
							<option value="full">Full Name</option>
							<option value="first">First Name</option>
							<option value="last">Last Name</option>
						</select>
				</div>
			{/if}

			{#if field.type === FieldType.Address}
				<div class="space-y-2">
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={((field.options as any)?.parts?.city !== false)}
							onchange={(e) => updateOptions({
								...(field.options || {}),
								parts: { ...((field.options as any)?.parts || {}), city: e.currentTarget.checked }
							})}
							class="rounded"
						/>
						Include City
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={((field.options as any)?.parts?.street !== false)}
							onchange={(e) => updateOptions({
								...(field.options || {}),
								parts: { ...((field.options as any)?.parts || {}), street: e.currentTarget.checked }
							})}
							class="rounded"
						/>
						Include Street
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={((field.options as any)?.parts?.zip || false)}
							onchange={(e) => updateOptions({
								...(field.options || {}),
								parts: { ...((field.options as any)?.parts || {}), zip: e.currentTarget.checked }
							})}
							class="rounded"
						/>
						Include ZIP
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={((field.options as any)?.parts?.country || false)}
							onchange={(e) => updateOptions({
								...(field.options || {}),
								parts: { ...((field.options as any)?.parts || {}), country: e.currentTarget.checked }
							})}
							class="rounded"
						/>
						Include Country
					</label>
				</div>
			{/if}
		</div>
	{/if}
</div>
