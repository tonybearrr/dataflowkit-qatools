import type { JsonNode, NodeType } from './types';

export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function jsonToTree(json: any, parentKey?: string): JsonNode | null {
	if (json === null || json === undefined) {
		return {
			id: generateId(),
			key: parentKey,
			type: 'null',
			value: null
		};
	}

	if (Array.isArray(json)) {
		return {
			id: generateId(),
			key: parentKey,
			type: 'array',
			children: json.map((item, index) => jsonToTree(item, `${index}`)).filter(Boolean) as JsonNode[]
		};
	}

	if (typeof json === 'object') {
		return {
			id: generateId(),
			key: parentKey,
			type: 'object',
			children: Object.entries(json).map(([key, value]) => jsonToTree(value, key)).filter(Boolean) as JsonNode[]
		};
	}

	return {
		id: generateId(),
		key: parentKey,
		type: typeof json as NodeType,
		value: json
	};
}

export function treeToJson(node: JsonNode | null): any {
	if (!node) return null;

	if (node.type === 'object' && node.children) {
		const obj: Record<string, any> = {};
		for (const child of node.children) {
			if (child.key !== undefined) {
				obj[child.key] = treeToJson(child);
			}
		}
		return obj;
	}

	if (node.type === 'array' && node.children) {
		return node.children.map((child) => treeToJson(child));
	}

	return node.value;
}

export function findNodeById(tree: JsonNode | null, id: string): JsonNode | null {
	if (!tree) return null;
	if (tree.id === id) return tree;

	if (tree.children) {
		for (const child of tree.children) {
			const found = findNodeById(child, id);
			if (found) return found;
		}
	}

	return null;
}

export function getNodePath(tree: JsonNode | null, targetId: string, path: string[] = []): string[] | null {
	if (!tree) return null;

	if (tree.id === targetId) {
		return path;
	}

	if (tree.children) {
		for (const child of tree.children) {
			let childPath: string[];
			if (tree.type === 'array') {
				childPath = [...path, `[${child.key}]`];
			} else {
				childPath = child.key !== undefined ? [...path, child.key] : path;
			}
			const found = getNodePath(child, targetId, childPath);
			if (found) {
				return found;
			}
		}
	}

	return null;
}

export function getPathString(tree: JsonNode | null, targetId: string): string | null {
	const path = getNodePath(tree, targetId);
	if (!path || path.length === 0) return null;

	// Join path parts, handling array indices
	let result = '';
	for (let i = 0; i < path.length; i++) {
		const part = path[i];
		if (part.startsWith('[')) {
			result += part;
		} else {
			if (i > 0 && !path[i - 1]?.startsWith('[')) {
				result += '.';
			}
			result += part;
		}
	}

	return result;
}

export function addChildNode(parent: JsonNode, type: NodeType, key?: string): JsonNode {
	const newNode: JsonNode = {
		id: generateId(),
		key,
		type,
		value: type === 'string' ? '' : type === 'number' ? 0 : type === 'boolean' ? false : null,
		children: type === 'object' || type === 'array' ? [] : undefined
	};

	if (!parent.children) {
		parent.children = [];
	}

	parent.children.push(newNode);
	return newNode;
}

export function removeNode(tree: JsonNode, targetId: string): boolean {
	if (!tree.children) return false;

	const index = tree.children.findIndex((child) => child.id === targetId);
	if (index !== -1) {
		tree.children.splice(index, 1);
		return true;
	}

	for (const child of tree.children) {
		if (removeNode(child, targetId)) {
			return true;
		}
	}

	return false;
}

export function duplicateNode(tree: JsonNode, targetId: string): JsonNode | null {
	const node = findNodeById(tree, targetId);
	if (!node) return null;

	const duplicated = deepCloneNode(node);
	duplicated.id = generateId();
	if (duplicated.key) {
		duplicated.key = `${duplicated.key}_copy`;
	}

	const parent = findParentNode(tree, targetId);
	if (parent && parent.children) {
		const index = parent.children.findIndex((child) => child.id === targetId);
		if (index !== -1) {
			parent.children.splice(index + 1, 0, duplicated);
			return duplicated;
		}
	}

	return null;
}

function findParentNode(tree: JsonNode, targetId: string): JsonNode | null {
	if (!tree.children) return null;

	for (const child of tree.children) {
		if (child.id === targetId) {
			return tree;
		}
		const found = findParentNode(child, targetId);
		if (found) return found;
	}

	return null;
}

function deepCloneNode(node: JsonNode): JsonNode {
	return {
		...node,
		children: node.children ? node.children.map((child) => deepCloneNode(child)) : undefined
	};
}

export function moveNode(tree: JsonNode, nodeId: string, direction: 'up' | 'down'): boolean {
	const parent = findParentNode(tree, nodeId);
	if (!parent || !parent.children) return false;

	const index = parent.children.findIndex((child) => child.id === nodeId);
	if (index === -1) return false;

	if (direction === 'up' && index > 0) {
		[parent.children[index - 1], parent.children[index]] = [parent.children[index], parent.children[index - 1]];
		return true;
	}

	if (direction === 'down' && index < parent.children.length - 1) {
		[parent.children[index], parent.children[index + 1]] = [parent.children[index + 1], parent.children[index]];
		return true;
	}

	return false;
}
