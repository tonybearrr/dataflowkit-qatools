export interface StatusCode {
	code: number;
	phrase: string;
	category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
	label: string;
	common: boolean;
	summaryKey: string;
	whenToUseKeys: string[];
	commonCausesKeys: string[];
	returnTemplate: {
		status: number;
		body: Record<string, any> | null;
	};
	checklistKeys: string[];
	related: number[];
}
