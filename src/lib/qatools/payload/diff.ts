export interface DiffChange {
	type: 'added' | 'removed' | 'modified' | 'unchanged';
	path: string;
	oldValue?: any;
	newValue?: any;
}

export function computeDiff(base: any, variant: any, path: string = ''): DiffChange[] {
	const changes: DiffChange[] = [];

	if (base === variant) {
		return [];
	}

	if (base === null || base === undefined) {
		if (variant !== null && variant !== undefined) {
			changes.push({
				type: 'added',
				path,
				newValue: variant
			});
		}
		return changes;
	}

	if (variant === null || variant === undefined) {
		changes.push({
			type: 'removed',
			path,
			oldValue: base
		});
		return changes;
	}

	if (typeof base !== typeof variant) {
		changes.push({
			type: 'modified',
			path,
			oldValue: base,
			newValue: variant
		});
		return changes;
	}

	if (Array.isArray(base) && Array.isArray(variant)) {
		const maxLen = Math.max(base.length, variant.length);
		for (let i = 0; i < maxLen; i++) {
			const itemPath = `${path}[${i}]`;
			if (i >= base.length) {
				changes.push({
					type: 'added',
					path: itemPath,
					newValue: variant[i]
				});
			} else if (i >= variant.length) {
				changes.push({
					type: 'removed',
					path: itemPath,
					oldValue: base[i]
				});
			} else {
				changes.push(...computeDiff(base[i], variant[i], itemPath));
			}
		}
		return changes;
	}

	if (typeof base === 'object' && typeof variant === 'object') {
		const allKeys = new Set([...Object.keys(base), ...Object.keys(variant)]);
		for (const key of allKeys) {
			const keyPath = path ? `${path}.${key}` : key;
			if (!(key in base)) {
				changes.push({
					type: 'added',
					path: keyPath,
					newValue: variant[key]
				});
			} else if (!(key in variant)) {
				changes.push({
					type: 'removed',
					path: keyPath,
					oldValue: base[key]
				});
			} else {
				changes.push(...computeDiff(base[key], variant[key], keyPath));
			}
		}
		return changes;
	}

	if (base !== variant) {
		changes.push({
			type: 'modified',
			path,
			oldValue: base,
			newValue: variant
		});
	}

	return changes;
}

export function hasChanges(changes: DiffChange[]): boolean {
	return changes.some((change) => change.type !== 'unchanged');
}
