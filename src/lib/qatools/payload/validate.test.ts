import { describe, it, expect } from 'vitest';
import { validateJson, formatJson } from './validate';

describe('validate', () => {
	it('should validate correct JSON', () => {
		const result = validateJson('{"name": "John"}');
		expect(result.valid).toBe(true);
		expect(result.json).toEqual({ name: 'John' });
	});

	it('should reject invalid JSON', () => {
		const result = validateJson('{"name": "John"');
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should format JSON with indentation', () => {
		const json = { name: 'John', age: 25 };
		const formatted = formatJson(json, false);
		expect(formatted).toContain('\n');
		expect(formatted).toContain('  ');
	});

	it('should minify JSON', () => {
		const json = { name: 'John', age: 25 };
		const minified = formatJson(json, true);
		expect(minified).not.toContain('\n');
		expect(minified).not.toContain('  ');
	});
});
