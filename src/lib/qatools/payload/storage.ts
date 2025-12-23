import type { ToolState, PayloadVariant } from './types';

const STORAGE_KEY = 'qa-toolbox-payload-v1';

export function loadState(): Partial<ToolState> {
	if (typeof window === 'undefined') return {};
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return {};
		}
	}
	return {};
}

export function saveState(state: Partial<ToolState>): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.warn('Failed to save payload state:', error);
	}
}

export function saveBasePayload(tree: any, raw: string): void {
	const state = loadState();
	state.basePayload = { tree, raw };
	saveState(state);
}

export function saveVariants(variants: PayloadVariant[]): void {
	const state = loadState();
	state.variants = variants;
	saveState(state);
}

export function saveSelectedVariant(variantId?: string): void {
	const state = loadState();
	state.selectedVariantId = variantId;
	saveState(state);
}

export function saveSelectedTemplate(templateId?: string): void {
	const state = loadState();
	state.selectedTemplate = templateId;
	saveState(state);
}

export function saveUIPreferences(preferences: ToolState['uiPreferences']): void {
	const state = loadState();
	state.uiPreferences = { ...state.uiPreferences, ...preferences };
	saveState(state);
}
