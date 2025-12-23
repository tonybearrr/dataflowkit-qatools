import type { FieldSchema, GeneratorConfig } from './types';

const STORAGE_KEY_SCHEMA = 'qa-toolbox-test-data-schema';
const STORAGE_KEY_CONFIG = 'qa-toolbox-test-data-config';

export function loadSchema(): FieldSchema[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(STORAGE_KEY_SCHEMA);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return [];
		}
	}
	return [];
}

export function saveSchema(schema: FieldSchema[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY_SCHEMA, JSON.stringify(schema));
}

export function loadConfig(): Partial<GeneratorConfig> {
	if (typeof window === 'undefined') return {};
	const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return {};
		}
	}
	return {};
}

export function saveConfig(config: Partial<GeneratorConfig>): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}
