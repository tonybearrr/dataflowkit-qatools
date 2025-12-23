<script lang="ts">
	import type { JsonNode, NodeType } from '../types';
	import {
		addChildNode,
		removeNode,
		duplicateNode,
		moveNode,
		getPathString,
		findNodeById
	} from '../treeOps';
	import { ChevronRight, ChevronDown, Plus, Trash2, Copy, ArrowUp, ArrowDown, X } from 'lucide-svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	interface Props {
		tree: JsonNode | null;
		onUpdate?: (tree: JsonNode | null) => void;
		onNodeSelect?: (nodeId: string, path: string) => void;
	}

	let { tree, onUpdate, onNodeSelect }: Props = $props();

	let expandedNodes = $state<Set<string>>(new Set());
	let showConfirm = $state(false);
	let nodeToDelete: string | null = $state(null);

	function collectAllNodeIds(node: JsonNode | null, ids: Set<string> = new Set()): Set<string> {
		if (!node) return ids;
		ids.add(node.id);
		if (node.children) {
			for (const child of node.children) {
				collectAllNodeIds(child, ids);
			}
		}
		return ids;
	}

	$effect(() => {
		if (tree) {
			expandedNodes = collectAllNodeIds(tree);
		}
	});

	function toggleExpand(nodeId: string) {
		const newSet = new Set(expandedNodes);
		if (newSet.has(nodeId)) {
			newSet.delete(nodeId);
		} else {
			newSet.add(nodeId);
		}
		expandedNodes = newSet;
	}

	function handleAddChild(parentId: string, type: NodeType, key?: string) {
		if (!tree) return;
		const parent = findNodeById(tree, parentId);
		if (!parent) return;
		const newKey = parent.type === 'object' ? '' : key || String(parent.children?.length || 0);
		const newNode = addChildNode(parent, type, newKey);
		onUpdate?.(tree);
	}

	function handleDelete(nodeId: string) {
		nodeToDelete = nodeId;
		showConfirm = true;
	}

	function confirmDelete() {
		if (!tree || !nodeToDelete) return;
		removeNode(tree, nodeToDelete);
		onUpdate?.(tree);
		showConfirm = false;
		nodeToDelete = null;
	}

	function handleDuplicate(nodeId: string) {
		if (!tree) return;
		duplicateNode(tree, nodeId);
		onUpdate?.(tree);
	}

	function handleMove(nodeId: string, direction: 'up' | 'down') {
		if (!tree) return;
		moveNode(tree, nodeId, direction);
		onUpdate?.(tree);
	}

	function handleNodeClick(nodeId: string) {
		if (!tree) return;
		const path = getPathString(tree, nodeId);
		if (path) {
			onNodeSelect?.(nodeId, path);
		}
	}

	function handleTypeChange(nodeId: string, newType: NodeType) {
		if (!tree) return;
		const node = findNodeById(tree, nodeId);
		if (!node) return;

		node.type = newType;
		if (newType === 'object' || newType === 'array') {
			node.children = [];
			node.value = undefined;
		} else {
			node.children = undefined;
			node.value = newType === 'string' ? '' : newType === 'number' ? 0 : newType === 'boolean' ? false : null;
		}
		onUpdate?.(tree);
	}

	function handleKeyChange(nodeId: string, newKey: string) {
		if (!tree) return;
		const node = findNodeById(tree, nodeId);
		if (!node) return;
		node.key = newKey;
		onUpdate?.(tree);
	}

	function handleValueChange(nodeId: string, newValue: any) {
		if (!tree) return;
		const node = findNodeById(tree, nodeId);
		if (!node) return;
		node.value = newValue;
		onUpdate?.(tree);
	}

	function traverseNodes(node: JsonNode, depth: number = 0): Array<{ node: JsonNode; depth: number; isExpanded: boolean; hasChildren: boolean; isObject: boolean; isArray: boolean }> {
		const isExpanded = expandedNodes.has(node.id);
		const hasChildren = node.children && node.children.length > 0;
		const isObject = node.type === 'object';
		const isArray = node.type === 'array';
		const result: Array<{ node: JsonNode; depth: number; isExpanded: boolean; hasChildren: boolean; isObject: boolean; isArray: boolean }> = [{ node, depth, isExpanded, hasChildren, isObject, isArray }];
		if (isExpanded && node.children) {
			for (const child of node.children) {
				result.push(...traverseNodes(child, depth + 1));
			}
		}
		return result;
	}
</script>

<div class="space-y-2">
	{#if !tree}
		<div class="text-center py-8 text-sm text-[var(--color-text-muted)]">
			<p>No payload structure. Start with a template or create manually.</p>
		</div>
	{:else}
		{#each traverseNodes(tree) as { node, depth, isExpanded, hasChildren, isObject, isArray }}
			<div
				class="flex items-center gap-2 px-1 rounded hover:bg-[var(--color-bg-secondary)] group"
				style="padding-left: {depth * 20 + 8}px"
			>
				<button
					onclick={() => hasChildren && toggleExpand(node.id)}
					class="w-4 h-4 flex items-center justify-center flex-shrink-0"
					disabled={!hasChildren}
				>
					{#if hasChildren}
						{#if isExpanded}
							<ChevronDown class="w-3 h-3" />
						{:else}
							<ChevronRight class="w-3 h-3" />
						{/if}
					{/if}
				</button>

				{#if isObject || isArray}
					<span class="text-xs font-mono text-[var(--color-text-muted)]">
						{isObject ? '{' : '['}
					</span>
				{/if}

				{#if depth > 0 && (isObject || node.key !== undefined)}
					<input
						type="text"
						value={node.key ?? ''}
						oninput={(e) => handleKeyChange(node.id, e.currentTarget.value)}
						class="text-sm font-medium bg-transparent border-none outline-none focus:bg-[var(--color-bg-tertiary)] px-1 rounded min-w-[60px]"
						placeholder="key"
					/>
					<span class="text-[var(--color-text-muted)]">:</span>
				{/if}

				<select
					value={node.type}
					onchange={(e) => handleTypeChange(node.id, e.currentTarget.value as NodeType)}
					class="text-xs px-1 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
				>
					<option value="string">string</option>
					<option value="number">number</option>
					<option value="boolean">boolean</option>
					<option value="null">null</option>
					<option value="object">object</option>
					<option value="array">array</option>
				</select>

				{#if !isObject && !isArray}
					{#if node.type === 'string'}
						<input
							type="text"
							value={node.value ?? ''}
							oninput={(e) => handleValueChange(node.id, e.currentTarget.value)}
							class="text-sm flex-1 px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
							placeholder="value"
						/>
					{:else if node.type === 'number'}
						<input
							type="number"
							value={node.value ?? 0}
							oninput={(e) => handleValueChange(node.id, parseFloat(e.currentTarget.value) || 0)}
							class="text-sm flex-1 px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
						/>
					{:else if node.type === 'boolean'}
						<input
							type="checkbox"
							checked={node.value ?? false}
							onchange={(e) => handleValueChange(node.id, e.currentTarget.checked)}
							class="w-4 h-4"
						/>
					{:else if node.type === 'null'}
						<span class="text-xs text-[var(--color-text-muted)]">null</span>
					{/if}
				{/if}

				<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					{#if isObject}
						<button
							onclick={() => handleAddChild(node.id, 'string')}
							class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
							title="Add property"
						>
							<Plus class="w-3 h-3" />
						</button>
					{/if}
					{#if isArray}
						<button
							onclick={() => handleAddChild(node.id, 'string', '0')}
							class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
							title="Add item"
						>
							<Plus class="w-3 h-3" />
						</button>
					{/if}
					<button
						onclick={() => handleNodeClick(node.id)}
						class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
						title="Select for breaker"
					>
						<X class="w-3 h-3" />
					</button>
					<button
						onclick={() => handleDuplicate(node.id)}
						class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
						title="Duplicate"
					>
						<Copy class="w-3 h-3" />
					</button>
					<button
						onclick={() => handleMove(node.id, 'up')}
						class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
						title="Move up"
					>
						<ArrowUp class="w-3 h-3" />
					</button>
					<button
						onclick={() => handleMove(node.id, 'down')}
						class="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
						title="Move down"
					>
						<ArrowDown class="w-3 h-3" />
					</button>
					<button
						onclick={() => handleDelete(node.id)}
						class="p-1 hover:bg-[var(--color-error)]/20 hover:text-[var(--color-error)] rounded"
						title="Delete"
					>
						<Trash2 class="w-3 h-3" />
					</button>
				</div>
			</div>
		{/each}
	{/if}
</div>

<ConfirmDialog
	open={showConfirm}
	title="Delete Node?"
	message="This will remove the node and all its children. Continue?"
	confirmLabel="Delete"
	cancelLabel="Cancel"
	onConfirm={confirmDelete}
	onCancel={() => {
		showConfirm = false;
		nodeToDelete = null;
	}}
/>
