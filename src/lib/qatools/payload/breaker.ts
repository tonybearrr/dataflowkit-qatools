import type { BreakerRule, PayloadVariant, JsonNode, Constraints } from './types';
import { jsonToTree } from './treeOps';

export function applyRules(basePayload: any, rules: BreakerRule[]): { payload: any; warnings: string[] } {
	const warnings: string[] = [];
	let payload = deepClone(basePayload);

	for (const rule of rules) {
		try {
			const result = applyRule(payload, rule);
			payload = result.payload;
			if (result.warning) {
				warnings.push(result.warning);
			}
		} catch (error) {
			warnings.push(`Failed to apply rule at ${rule.path}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return { payload, warnings };
}

function applyRule(payload: any, rule: BreakerRule): { payload: any; warning?: string } {
	const pathParts = parsePath(rule.path);
	const target = getValueAtPath(payload, pathParts);

	if (target === undefined) {
		return { payload, warning: `Path ${rule.path} not found` };
	}

	switch (rule.mode) {
		case 'remove':
			return { payload: removeAtPath(payload, pathParts) };

		case 'setNull':
			return { payload: setValueAtPath(payload, pathParts, null) };

		case 'wrongType':
			return { payload: setValueAtPath(payload, pathParts, convertToWrongType(target, rule.params?.targetType)) };

		case 'emptyString':
			if (typeof target === 'string') {
				return { payload: setValueAtPath(payload, pathParts, '') };
			}
			return { payload, warning: `Cannot apply emptyString to non-string at ${rule.path}` };

		case 'tooLong':
			if (typeof target === 'string') {
				const length = rule.params?.length || 512;
				return { payload: setValueAtPath(payload, pathParts, 'x'.repeat(length + 1)) };
			}
			return { payload, warning: `Cannot apply tooLong to non-string at ${rule.path}` };

		case 'outOfRange':
			if (typeof target === 'number') {
				const value = rule.params?.value ?? target > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
				return { payload: setValueAtPath(payload, pathParts, value) };
			}
			return { payload, warning: `Cannot apply outOfRange to non-number at ${rule.path}` };

		case 'invalidEnum':
			const invalidValue = rule.params?.enumValue || 'INVALID';
			return { payload: setValueAtPath(payload, pathParts, invalidValue) };

		default:
			return { payload, warning: `Unknown rule mode: ${rule.mode}` };
	}
}

function convertToWrongType(value: any, targetType?: string): any {
	const currentType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;

	if (targetType) {
		switch (targetType) {
			case 'string':
				return String(value);
			case 'number':
				return typeof value === 'string' ? 0 : value === true ? 1 : value === false ? 0 : 0;
			case 'boolean':
				return Boolean(value);
			case 'null':
				return null;
			case 'object':
				return Array.isArray(value) ? {} : typeof value === 'string' ? '{}' : {};
			case 'array':
				return typeof value === 'object' && !Array.isArray(value) ? [] : '[]';
		}
	}

	// Auto-detect wrong type
	switch (currentType) {
		case 'string':
			return 0;
		case 'number':
			return '0';
		case 'boolean':
			return 'true';
		case 'object':
			return '{}';
		case 'array':
			return {};
		case 'null':
			return 'null';
		default:
			return null;
	}
}

function parsePath(path: string): (string | number)[] {
	const parts: (string | number)[] = [];
	const regex = /(\w+)|\[(\d+)\]/g;
	let match;

	while ((match = regex.exec(path)) !== null) {
		if (match[1]) {
			parts.push(match[1]);
		} else if (match[2]) {
			parts.push(parseInt(match[2], 10));
		}
	}

	return parts;
}

function getValueAtPath(obj: any, path: (string | number)[]): any {
	let current = obj;
	for (const part of path) {
		if (current === undefined || current === null) {
			return undefined;
		}
		current = current[part];
	}
	return current;
}

function setValueAtPath(obj: any, path: (string | number)[], value: any): any {
	const result = deepClone(obj);
	let current = result;

	for (let i = 0; i < path.length - 1; i++) {
		const part = path[i];
		if (current[part] === undefined || current[part] === null) {
			current[part] = typeof part === 'number' ? [] : {};
		}
		current = current[part];
	}

	current[path[path.length - 1]] = value;
	return result;
}

function removeAtPath(obj: any, path: (string | number)[]): any {
	const result = deepClone(obj);
	let current = result;

	for (let i = 0; i < path.length - 1; i++) {
		const part = path[i];
		if (current[part] === undefined || current[part] === null) {
			return result; // Path doesn't exist
		}
		current = current[part];
	}

	const lastKey = path[path.length - 1];
	if (Array.isArray(current)) {
		current.splice(lastKey as number, 1);
	} else {
		delete current[lastKey];
	}

	return result;
}

function deepClone(obj: any): any {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => deepClone(item));
	}

	const cloned: Record<string, any> = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cloned[key] = deepClone(obj[key]);
		}
	}

	return cloned;
}

export function generatePresetRules(
	basePayload: any,
	preset: 'missingRequired' | 'wrongTypes' | 'nullsEverywhere' | 'edgeValues' | 'mixedErrors',
	metadata?: Record<string, { required?: boolean; constraints?: Constraints }>
): BreakerRule[] {
	const rules: BreakerRule[] = [];
	const tree = jsonToTree(basePayload);

	if (!tree) return rules;

	function isRequired(path: string): boolean {
		if (!metadata) return false;
		// Check if the field is required by path in metadata
		// First check the full path, then the last part
		const meta = metadata[path];
		if (meta?.required === true) return true;
		
		// If the path is complex (e.g. "user.email"), check the last part
		const parts = path.split('.');
		if (parts.length > 1) {
			const lastPart = parts[parts.length - 1];
			const lastMeta = metadata[lastPart];
			if (lastMeta?.required === true) return true;
		}
		
		return false;
	}

	function traverse(node: JsonNode, path: string = '') {
		const currentPath = path ? `${path}.${node.key || ''}` : node.key || '';
		const isFieldRequired = isRequired(currentPath) || node.meta?.required;

		if (preset === 'missingRequired' && isFieldRequired) {
			rules.push({
				id: `${Date.now()}-${Math.random()}`,
				path: currentPath,
				mode: 'remove'
			});
		}

		if (preset === 'wrongTypes' && node.type !== 'object' && node.type !== 'array') {
			rules.push({
				id: `${Date.now()}-${Math.random()}`,
				path: currentPath,
				mode: 'wrongType'
			});
		}

		if (preset === 'nullsEverywhere' && !isFieldRequired) {
			rules.push({
				id: `${Date.now()}-${Math.random()}`,
				path: currentPath,
				mode: 'setNull'
			});
		}

		if (preset === 'edgeValues') {
			if (node.type === 'number') {
				rules.push({
					id: `${Date.now()}-${Math.random()}`,
					path: currentPath,
					mode: 'outOfRange',
					params: { value: Number.MAX_SAFE_INTEGER }
				});
			} else if (node.type === 'string') {
				rules.push({
					id: `${Date.now()}-${Math.random()}`,
					path: currentPath,
					mode: 'tooLong',
					params: { length: 512 }
				});
			}
		}

		if (preset === 'mixedErrors') {
			if (isFieldRequired) {
				rules.push({
					id: `${Date.now()}-${Math.random()}`,
					path: currentPath,
					mode: 'remove'
				});
			} else if (node.type === 'string') {
				rules.push({
					id: `${Date.now()}-${Math.random()}`,
					path: currentPath,
					mode: 'wrongType'
				});
			}
		}

		if (node.children) {
			for (const child of node.children) {
				const childPath = node.type === 'array' ? `${currentPath}[${child.key}]` : currentPath;
				traverse(child, childPath);
			}
		}
	}

	if (tree.children) {
		for (const child of tree.children) {
			traverse(child);
		}
	}

	return rules;
}
