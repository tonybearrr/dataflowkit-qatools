import { describe, it, expect } from 'vitest';
import { parseHeaders } from './parseHeaders';

describe('parseHeaders', () => {
	it('should parse simple headers', () => {
		const input = 'Content-Type: application/json\nAuthorization: Bearer token123';
		const result = parseHeaders(input, 'request');

		expect(result.headers).toHaveLength(2);
		expect(result.headers[0].name).toBe('Content-Type');
		expect(result.headers[0].value).toBe('application/json');
		expect(result.headers[1].name).toBe('Authorization');
		expect(result.headers[1].value).toBe('Bearer token123');
	});

	it('should handle duplicate headers', () => {
		const input = 'Set-Cookie: session=abc\nSet-Cookie: theme=dark';
		const result = parseHeaders(input, 'response');

		expect(result.headers).toHaveLength(2);
		expect(result.headers[0].duplicateCount).toBe(2);
		expect(result.headers[1].duplicateCount).toBe(2);
	});

	it('should handle folded header values', () => {
		const input = 'Cache-Control: public,\n  max-age=3600,\n  must-revalidate';
		const result = parseHeaders(input, 'response');

		expect(result.headers).toHaveLength(1);
		expect(result.headers[0].value).toBe('public, max-age=3600, must-revalidate');
	});

	it('should normalize header names to lowercase', () => {
		const input = 'Content-Type: application/json';
		const result = parseHeaders(input, 'request');

		expect(result.headers[0].normalizedName).toBe('content-type');
	});

	it('should skip HTTP status line', () => {
		const input = 'HTTP/1.1 200 OK\nContent-Type: application/json';
		const result = parseHeaders(input, 'response');

		expect(result.headers).toHaveLength(1);
		expect(result.headers[0].name).toBe('Content-Type');
	});

	it('should skip request line', () => {
		const input = 'GET /api/users HTTP/1.1\nContent-Type: application/json';
		const result = parseHeaders(input, 'request');

		expect(result.headers).toHaveLength(1);
		expect(result.headers[0].name).toBe('Content-Type');
	});

	it('should handle empty input', () => {
		const result = parseHeaders('', 'request');
		expect(result.headers).toHaveLength(0);
	});

	it('should handle whitespace trimming', () => {
		const input = '  Content-Type  :  application/json  ';
		const result = parseHeaders(input, 'request');

		expect(result.headers[0].name).toBe('Content-Type');
		expect(result.headers[0].value).toBe('application/json');
	});

	it('should preserve original value', () => {
		const input = 'Content-Type: application/json';
		const result = parseHeaders(input, 'request');

		expect(result.headers[0].originalValue).toBe('application/json');
	});

	it('should ignore empty lines between headers', () => {
		const input = 'Content-Type: application/json\n\nCache-Control: public, max-age=0';
		const result = parseHeaders(input, 'response');

		expect(result.headers).toHaveLength(2);
		expect(result.headers[0].name).toBe('Content-Type');
		expect(result.headers[1].name).toBe('Cache-Control');
	});

	it('should ignore multiple empty lines', () => {
		const input = 'Content-Type: application/json\n\n\nCache-Control: no-cache';
		const result = parseHeaders(input, 'response');

		expect(result.headers).toHaveLength(2);
		expect(result.headers[0].name).toBe('Content-Type');
		expect(result.headers[1].name).toBe('Cache-Control');
	});
});

