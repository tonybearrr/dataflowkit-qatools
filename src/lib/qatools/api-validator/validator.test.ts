import { describe, it, expect } from 'vitest';
import { validatePayload, mapAjvError, parseJson } from './validator';
import type { ErrorObject } from 'ajv';

describe('api-validator', () => {
	describe('parseJson', () => {
		it('should parse valid JSON', () => {
			const result = parseJson('{"key": "value"}');
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({ key: 'value' });
			}
		});

		it('should return error for invalid JSON', () => {
			const result = parseJson('{"key": invalid}');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toContain('JSON');
			}
		});
	});

	describe('mapAjvError', () => {
		it('should map required error', () => {
			const ajvError: ErrorObject = {
				instancePath: '/user',
				schemaPath: '#/properties/user/required',
				keyword: 'required',
				params: { missingProperty: 'email' },
				message: 'must have required property \'email\''
			};
			const result = mapAjvError(ajvError);
			expect(result.keyword).toBe('required');
			expect(result.message).toContain('Missing required field');
			expect(result.message).toContain('email');
		});

		it('should map type error', () => {
			const ajvError: ErrorObject = {
				instancePath: '/age',
				schemaPath: '#/properties/age/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			const result = mapAjvError(ajvError);
			expect(result.keyword).toBe('type');
			expect(result.expected).toBe('number');
			expect(result.message).toContain('Expected');
		});

		it('should map format error', () => {
			const ajvError: ErrorObject = {
				instancePath: '/email',
				schemaPath: '#/properties/email/format',
				keyword: 'format',
				params: { format: 'email' },
				message: 'must match format "email"'
			};
			const result = mapAjvError(ajvError);
			expect(result.keyword).toBe('format');
			expect(result.message).toContain('Invalid format');
		});
	});

	describe('validatePayload', () => {
		it('should validate correct payload', () => {
			const schema = JSON.stringify({
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number' }
				},
				required: ['name', 'age']
			});
			const payload = JSON.stringify({ name: 'John', age: 30 });
			
			const result = validatePayload(payload, schema);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect missing required field', () => {
			const schema = JSON.stringify({
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number' }
				},
				required: ['name', 'age']
			});
			const payload = JSON.stringify({ name: 'John' });
			
			const result = validatePayload(payload, schema);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0].keyword).toBe('required');
		});

		it('should detect type mismatch', () => {
			const schema = JSON.stringify({
				type: 'object',
				properties: {
					age: { type: 'number' }
				}
			});
			const payload = JSON.stringify({ age: 'thirty' });
			
			const result = validatePayload(payload, schema);
			expect(result.valid).toBe(false);
			const typeError = result.errors.find(e => e.keyword === 'type');
			expect(typeError).toBeDefined();
		});

		it('should handle parse errors', () => {
			const schema = JSON.stringify({ type: 'object' });
			const payload = '{"invalid": json}';
			
			const result = validatePayload(payload, schema);
			expect(result.valid).toBe(false);
			expect(result.parseError).toBeDefined();
		});

		it('should handle schema parse errors', () => {
			const schema = '{"invalid": schema}';
			const payload = JSON.stringify({});
			
			const result = validatePayload(payload, schema);
			expect(result.valid).toBe(false);
			expect(result.schemaParseError).toBeDefined();
		});
	});
});

