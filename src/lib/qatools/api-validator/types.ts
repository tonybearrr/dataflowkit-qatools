export interface ValidationIssue {
	path: string;
	jsonPointer: string;
	message: string;
	keyword: string;
	params?: Record<string, any>;
	schemaPath?: string;
	instancePath?: string;
	expected?: string;
	received?: string;
}

export interface ParseError {
	message: string;
	line?: number;
	column?: number;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationIssue[];
	parseError?: ParseError;
	schemaParseError?: ParseError;
}

export interface ApiValidatorState {
	payload: string;
	schema: string;
	autoValidate: boolean;
	lastPreset?: string;
}

