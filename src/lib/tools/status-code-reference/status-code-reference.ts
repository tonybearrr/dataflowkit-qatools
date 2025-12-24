import { statusCodes as dataset } from './dataset';
import type { StatusCode } from './types';

export { statusCodes } from './dataset';
export { getStatusCode, getStatusCodesByCategory, getCommonStatusCodes, getRelatedStatusCodes } from './dataset';

export function searchStatusCodes(
	query: string,
	locale: (key: string) => string
): StatusCode[] {
	if (!query.trim()) return dataset;
	
	const lowerQuery = query.toLowerCase();
	const numericQuery = query.replace(/\D/g, '');
	
	return dataset.filter((sc) => {
		// Match by code
		if (numericQuery && (sc.code.toString().includes(numericQuery) || sc.code.toString().startsWith(numericQuery))) {
			return true;
		}
		
		// Match by phrase (English)
		if (sc.phrase.toLowerCase().includes(lowerQuery)) {
			return true;
		}
		
		// Match by summary (using i18n)
		const summary = locale(sc.summaryKey);
		if (summary && summary.toLowerCase().includes(lowerQuery)) {
			return true;
		}
		
		// Match by when to use
		for (const key of sc.whenToUseKeys) {
			const text = locale(key);
			if (text && text.toLowerCase().includes(lowerQuery)) {
				return true;
			}
		}
		
		// Match by common causes
		for (const key of sc.commonCausesKeys) {
			const text = locale(key);
			if (text && text.toLowerCase().includes(lowerQuery)) {
				return true;
			}
		}
		
		// Match by checklist
		for (const key of sc.checklistKeys) {
			const text = locale(key);
			if (text && text.toLowerCase().includes(lowerQuery)) {
				return true;
			}
		}
		
		// Match by category label
		const categoryLabel = locale(`statusCodeReference.categoryLabel.${sc.label}`);
		if (categoryLabel && categoryLabel.toLowerCase().includes(lowerQuery)) {
			return true;
		}
		
		return false;
	});
}

export function filterStatusCodes(
	codes: StatusCode[],
	category: string | null,
	commonOnly: boolean
): StatusCode[] {
	let filtered = codes;
	
	if (category && category !== 'all') {
		filtered = filtered.filter((sc) => sc.category === category);
	}
	
	if (commonOnly) {
		filtered = filtered.filter((sc) => sc.common);
	}
	
	return filtered;
}
