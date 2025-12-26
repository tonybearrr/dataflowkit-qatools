import { describe, it, expect } from 'vitest';
import { parseHttpDump, extractAuthorization, extractCookieHeader } from './parser';

describe('parseHttpDump', () => {
	it('should parse request headers', () => {
		const input = `GET /api/users HTTP/1.1
Host: example.com
Authorization: Bearer token123
Cookie: session=abc`;

		const result = parseHttpDump(input, 'request');

		expect(result.requestHeaders['host']).toBe('example.com');
		expect(result.requestHeaders['authorization']).toBe('Bearer token123');
		expect(result.cookies.cookieHeader).toBe('session=abc');
		expect(result.authorization).toBe('Bearer token123');
	});

	it('should parse response headers with status code', () => {
		const input = `HTTP/1.1 401 Unauthorized
Content-Type: application/json
WWW-Authenticate: Bearer realm="api"
Set-Cookie: session=expired; Path=/`;

		const result = parseHttpDump(input, 'response');

		expect(result.statusCode).toBe(401);
		expect(result.responseHeaders['content-type']).toBe('application/json');
		expect(result.responseHeaders['www-authenticate']).toBe('Bearer realm="api"');
		expect(result.cookies.setCookie).toHaveLength(1);
		expect(result.cookies.setCookie[0]).toContain('session=expired');
	});

	it('should parse combined request and response', () => {
		const input = `Request Headers:
Authorization: Bearer token123

Response Headers:
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope"`;

		const result = parseHttpDump(input, 'combined');

		expect(result.requestHeaders['authorization']).toBe('Bearer token123');
		expect(result.statusCode).toBe(403);
		expect(result.responseHeaders['www-authenticate']).toBe('Bearer error="insufficient_scope"');
	});

	it('should handle multiple Set-Cookie headers', () => {
		const input = `HTTP/1.1 200 OK
Set-Cookie: session=abc; Path=/
Set-Cookie: csrf=token; Secure`;

		const result = parseHttpDump(input, 'response');

		expect(result.cookies.setCookie).toHaveLength(2);
	});

	it('should handle duplicate headers', () => {
		const input = `Vary: Accept
Vary: Origin
Authorization: Bearer token1
Authorization: Bearer token2`;

		const result = parseHttpDump(input, 'request');

		const vary = result.requestHeaders['vary'];
		expect(Array.isArray(vary)).toBe(true);
		expect(vary).toHaveLength(2);

		const auth = result.requestHeaders['authorization'];
		expect(Array.isArray(auth)).toBe(true);
		expect(auth).toHaveLength(2);
	});

	it('should handle case-insensitive header names', () => {
		const input = `AUTHORIZATION: Bearer token
Cookie: session=abc`;

		const result = parseHttpDump(input, 'request');

		expect(result.requestHeaders['authorization']).toBe('Bearer token');
		expect(result.cookies.cookieHeader).toBe('session=abc');
	});

	it('should extract authorization from headers', () => {
		const headers = { authorization: 'Bearer token123' };
		expect(extractAuthorization(headers)).toBe('Bearer token123');
	});

	it('should extract cookie header from headers', () => {
		const headers = { cookie: 'session=abc; theme=dark' };
		expect(extractCookieHeader(headers)).toBe('session=abc; theme=dark');
	});
});

