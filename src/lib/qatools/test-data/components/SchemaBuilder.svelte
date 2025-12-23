<script lang="ts">
	import type { FieldSchema } from '../types';
	import { FieldType } from '../types';
	import { Plus } from 'lucide-svelte';
	import FieldEditor from './FieldEditor.svelte';

	interface Props {
		schema: FieldSchema[];
		onupdate?: (schema: FieldSchema[]) => void;
	}

	let { schema, onupdate }: Props = $props();

	function addField() {
		const newField: FieldSchema = {
			id: Date.now().toString(),
			name: `field${schema.length + 1}`,
			type: FieldType.String,
			required: true,
			nullable: false,
			nullChance: 0
		};
		onupdate?.([...schema, newField]);
	}

	function updateField(index: number, updates: Partial<FieldSchema>) {
		const updated = [...schema];
		updated[index] = { ...updated[index], ...updates };
		onupdate?.(updated);
	}

	function deleteField(index: number) {
		if (confirm('Delete this field?')) {
			const updated = [...schema];
			updated.splice(index, 1);
			onupdate?.(updated);
		}
	}

	function duplicateField(index: number) {
		const field = schema[index];
		const newField: FieldSchema = {
			...field,
			id: Date.now().toString(),
			name: `${field.name}_copy`
		};
		const updated = [...schema];
		updated.splice(index + 1, 0, newField);
		onupdate?.(updated);
	}

	function moveField(index: number, direction: 'up' | 'down') {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= schema.length) return;
		const updated = [...schema];
		[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
		onupdate?.(updated);
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold">Fields</h3>
		<button
			onclick={addField}
			class="px-3 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
		>
			<Plus class="w-4 h-4" />
			Add Field
		</button>
	</div>

	{#if schema.length === 0}
		<div class="p-8 text-center border border-dashed border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">
			<p class="text-sm text-[var(--color-text-muted)]">No fields yet. Click "Add Field" to start.</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each schema as field, index}
				<FieldEditor
					{field}
					onupdate={(updates) => updateField(index, updates)}
					ondelete={() => deleteField(index)}
					onduplicate={() => duplicateField(index)}
					onmoveup={() => moveField(index, 'up')}
					onmovedown={() => moveField(index, 'down')}
					canMoveUp={index > 0}
					canMoveDown={index < schema.length - 1}
				/>
			{/each}
		</div>
	{/if}
</div>
