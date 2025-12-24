import type { ApiValidatorState } from './types';

const STORAGE_KEY = 'qa-toolbox-api-validator-state';

export function loadState(): ApiValidatorState | null {
	if (typeof window === 'undefined') return null;
	
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return null;
		return JSON.parse(stored);
	} catch {
		return null;
	}
}

export function saveState(state: ApiValidatorState): void {
	if (typeof window === 'undefined') return;
	
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignore storage errors
	}
}

export function clearState(): void {
	if (typeof window === 'undefined') return;
	
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Ignore storage errors
	}
}

