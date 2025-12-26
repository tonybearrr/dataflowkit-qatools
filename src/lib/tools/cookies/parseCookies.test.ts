import { describe, it, expect } from 'vitest';
import { parseCookies } from './parseCookies';

describe('parseCookies', () => {
	it('should parse Set-Cookie header with all attributes', () => {
		const input = 'Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600; Domain=example.com';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies).toHaveLength(1);
		expect(result.cookies[0].name).toBe('session');
		expect(result.cookies[0].value).toBe('abc123');
		expect(result.cookies[0].attrs.secure).toBe(true);
		expect(result.cookies[0].attrs.httpOnly).toBe(true);
		expect(result.cookies[0].attrs.sameSite).toBe('Lax');
		expect(result.cookies[0].attrs.path).toBe('/');
		expect(result.cookies[0].attrs.maxAge).toBe(3600);
		expect(result.cookies[0].attrs.domain).toBe('example.com');
		expect(result.cookies[0].hostOnly).toBe(false);
	});

	it('should parse multiple Set-Cookie headers', () => {
		const input = `Set-Cookie: session=abc123; Secure; HttpOnly; Path=/
Set-Cookie: theme=dark; Path=/; Max-Age=31536000`;
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies).toHaveLength(2);
		expect(result.cookies[0].name).toBe('session');
		expect(result.cookies[1].name).toBe('theme');
	});

	it('should parse Cookie header with multiple cookies', () => {
		const input = 'Cookie: session=abc123; theme=dark; csrf=token123';
		const result = parseCookies(input, 'cookie');

		expect(result.cookies).toHaveLength(3);
		expect(result.cookies[0].name).toBe('session');
		expect(result.cookies[1].name).toBe('theme');
		expect(result.cookies[2].name).toBe('csrf');
	});

	it('should handle host-only cookies (no Domain attribute)', () => {
		const input = 'Set-Cookie: session=abc123; Path=/';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies[0].hostOnly).toBe(true);
		expect(result.cookies[0].attrs.domain).toBeUndefined();
	});

	it('should set hostOnly=false when Domain is provided', () => {
		const input = 'Set-Cookie: api_token=ghi789; Domain=api.example.com; Secure; HttpOnly; Path=/';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies[0].hostOnly).toBe(false);
		expect(result.cookies[0].attrs.domain).toBe('api.example.com');
	});

	it('should normalize domain (trim, lowercase, strip leading dot)', () => {
		const input = 'Set-Cookie: session=abc123; Domain= .EXAMPLE.COM ; Path=/';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies[0].hostOnly).toBe(false);
		expect(result.cookies[0].attrs.domain).toBe('example.com');
	});

	it('should parse Expires date', () => {
		const input = 'Set-Cookie: session=abc123; Expires=Wed, 21 Oct 2025 07:28:00 GMT';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies[0].attrs.expires).toBeInstanceOf(Date);
	});

	it('should handle invalid Expires date', () => {
		const input = 'Set-Cookie: session=abc123; Expires=invalid-date';
		const result = parseCookies(input, 'set-cookie');

		expect(typeof result.cookies[0].attrs.expires).toBe('string');
		expect(result.cookies[0].attrs.expires).toBe('invalid-date');
	});

	it('should remove quotes from cookie value', () => {
		const input = 'Set-Cookie: session="abc123"; Path=/';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies[0].value).toBe('abc123');
	});

	it('should handle SameSite=None', () => {
		const input = 'Set-Cookie: session=abc123; SameSite=None; Secure';
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies[0].attrs.sameSite).toBe('None');
	});

	it('should skip empty lines', () => {
		const input = `Set-Cookie: session=abc123; Path=/

Set-Cookie: theme=dark; Path=/`;
		const result = parseCookies(input, 'set-cookie');

		expect(result.cookies).toHaveLength(2);
	});
});

