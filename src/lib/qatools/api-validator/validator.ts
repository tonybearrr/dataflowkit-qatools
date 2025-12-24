import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { ValidationIssue, ValidationResult, ParseError } from './types';

	let ajvInstance: Ajv2020 | null = null;
	const schemaCache = new Map<string, ReturnType<Ajv2020['compile']>>();

function getAjvInstance(): Ajv2020 {
	if (!ajvInstance) {
		ajvInstance = new Ajv2020({
			allErrors: true,
			strict: false,
			verbose: true,
			allowUnionTypes: true
		});
		addFormats(ajvInstance);
	}
	return ajvInstance;
}

export function parseJson(text: string): { success: true; data: any } | { success: false; error: ParseError } {
	try {
		const data = JSON.parse(text);
		return { success: true, data };
	} catch (error) {
		const err = error as Error;
		const match = err.message.match(/position (\d+)/);
		let line: number | undefined;
		let column: number | undefined;

		if (match) {
			const position = parseInt(match[1], 10);
			const lines = text.substring(0, position).split('\n');
			line = lines.length;
			column = lines[lines.length - 1].length + 1;
		}

		return {
			success: false,
			error: {
				message: err.message,
				line,
				column
			}
		};
	}
}

function jsonPointerToPath(pointer: string): string {
	if (!pointer || pointer === '') return '$';
	
	const parts: string[] = [];
	const segments = pointer.split('/').slice(1);
	
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i].replace(/~1/g, '/').replace(/~0/g, '~');
		if (/^\d+$/.test(segment)) {
			parts.push(`[${segment}]`);
		} else {
			if (i > 0 && !parts[parts.length - 1]?.startsWith('[')) {
				parts.push('.');
			}
			parts.push(segment);
		}
	}

	return '$' + parts.join('');
}

export function mapAjvError(error: ErrorObject): ValidationIssue {
	const instancePath = error.instancePath || '';
	const jsonPointer = instancePath.startsWith('/') ? instancePath : `/${instancePath}`;
	const humanPath = jsonPointerToPath(jsonPointer);

	let message = error.message || '';
	let expected: string | undefined;
	let received: string | undefined;

	switch (error.keyword) {
		case 'required':
			message = `Missing required field: ${error.params?.missingProperty || 'unknown'}`;
			break;
		case 'type':
			expected = Array.isArray(error.params?.type) 
				? error.params.type.join(' or ') 
				: error.params?.type || 'unknown';
			received = typeof error.data;
			message = `Expected ${expected}, got ${received}`;
			break;
		case 'format':
			message = `Invalid format: ${error.params?.format || 'unknown'}`;
			break;
		case 'additionalProperties':
			message = `Unexpected field: ${error.params?.additionalProperty || 'unknown'}`;
			break;
		case 'minLength':
			message = `String length must be at least ${error.params?.limit || 0} characters`;
			break;
		case 'maxLength':
			message = `String length must be at most ${error.params?.limit || 0} characters`;
			break;
		case 'minimum':
			message = `Value must be at least ${error.params?.limit || 0}`;
			break;
		case 'maximum':
			message = `Value must be at most ${error.params?.limit || 0}`;
			break;
		case 'pattern':
			message = `Value does not match pattern: ${error.params?.pattern || 'unknown'}`;
			break;
		case 'enum':
			message = `Value must be one of: ${(error.params?.allowedValues || []).join(', ')}`;
			break;
		case 'const':
			message = `Value must be exactly: ${JSON.stringify(error.params?.allowedValue)}`;
			break;
		case 'minItems':
			message = `Array must contain at least ${error.params?.limit || 0} items`;
			break;
		case 'maxItems':
			message = `Array must contain at most ${error.params?.limit || 0} items`;
			break;
		case 'uniqueItems':
			message = 'Array items must be unique';
			break;
		case 'minProperties':
			message = `Object must have at least ${error.params?.limit || 0} properties`;
			break;
		case 'maxProperties':
			message = `Object must have at most ${error.params?.limit || 0} properties`;
			break;
		default:
			message = error.message || `Validation failed: ${error.keyword}`;
	}

	return {
		path: humanPath,
		jsonPointer,
		message,
		keyword: error.keyword,
		params: error.params,
		schemaPath: error.schemaPath,
		instancePath: error.instancePath,
		expected,
		received
	};
}

export function validatePayload(
	payloadText: string,
	schemaText: string
): ValidationResult {
	const payloadParse = parseJson(payloadText);
	if (!payloadParse.success) {
		return {
			valid: false,
			errors: [],
			parseError: payloadParse.error
		};
	}

	const schemaParse = parseJson(schemaText);
	if (!schemaParse.success) {
		return {
			valid: false,
			errors: [],
			schemaParseError: schemaParse.error
		};
	}

	const schema = schemaParse.data;
	const payload = payloadParse.data;

	try {
		const ajv = getAjvInstance();
		const schemaKey = JSON.stringify(schema);
		
		let validateFn: ReturnType<Ajv2020['compile']>;
		if (schemaCache.has(schemaKey)) {
			validateFn = schemaCache.get(schemaKey)!;
		} else {
			validateFn = ajv.compile(schema);
			schemaCache.set(schemaKey, validateFn);
		}

		const valid = validateFn(payload);
		
		if (valid) {
			return {
				valid: true,
				errors: []
			};
		}

		const errors = (validateFn.errors || []).map(mapAjvError);

		return {
			valid: false,
			errors
		};
	} catch (error) {
		const err = error as Error;
		return {
			valid: false,
			errors: [{
				path: '$',
				jsonPointer: '',
				message: `Schema compilation error: ${err.message}`,
				keyword: 'compile',
				params: {}
			}]
		};
	}
}

export function formatJson(text: string): string | null {
	const parse = parseJson(text);
	if (!parse.success) {
		return null;
	}
	return JSON.stringify(parse.data, null, 2);
}

