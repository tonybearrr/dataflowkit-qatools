export interface ParsedHeader {
	name: string;
	normalizedName: string; // lowercase
	value: string;
	originalValue: string; // with original whitespace
	duplicateCount: number;
	lineNumber?: number;
}

export interface HeaderInfo {
	name: string;
	normalizedName: string;
	shortDescription: string;
	descriptionKey: string;
	category: HeaderCategory;
	whenToUseKeys: string[];
	commonMistakesKeys: string[];
	securityNotesKey?: string;
	references?: string[];
}

export type HeaderCategory =
	| 'authentication'
	| 'content'
	| 'caching'
	| 'cors'
	| 'cookies'
	| 'security'
	| 'redirection'
	| 'forwarding'
	| 'other';

export interface DetectedIssue {
	severity: 'error' | 'warning' | 'info';
	message: string;
	messageKey: string;
	whyKey?: string;
	headerNames?: string[];
}

export interface ParsedHeadersResult {
	headers: ParsedHeader[];
	issues: DetectedIssue[];
	requestType: 'request' | 'response';
}

