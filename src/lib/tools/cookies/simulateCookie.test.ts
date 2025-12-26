import { describe, it, expect } from 'vitest';
import { canSendCookie, deriveContextFromUrls } from './simulateCookie';
import type { ParsedCookie, CookieContext } from './types';

describe('canSendCookie', () => {
	it('should block secure cookie on HTTP', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { secure: true },
			hostOnly: true,
			rawLine: 'session=abc123; Secure'
		};

		const context: CookieContext = {
			siteUrl: 'http://example.com',
			requestUrl: 'http://example.com/api',
			isHttps: false,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: false
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.secureNotHttps');
	});

	it('should block expired cookie', () => {
		const pastDate = new Date('2020-01-01');
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { expires: pastDate },
			hostOnly: true,
			rawLine: 'session=abc123; Expires=Wed, 01 Jan 2020 00:00:00 GMT'
		};

		const context: CookieContext = {
			siteUrl: 'https://example.com',
			requestUrl: 'https://example.com/api',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: false
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.expired');
	});

	it('should block SameSite=Strict on cross-site', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { sameSite: 'Strict', secure: true },
			hostOnly: true,
			rawLine: 'session=abc123; SameSite=Strict; Secure'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.sameSiteStrictCrossSite');
	});

	it('should allow SameSite=Lax on cross-site top-level navigation GET', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { sameSite: 'Lax', secure: true },
			hostOnly: true,
			rawLine: 'session=abc123; SameSite=Lax; Secure'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: true,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(true);
	});

	it('should block SameSite=Lax on cross-site XHR', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { sameSite: 'Lax', secure: true },
			hostOnly: true,
			rawLine: 'session=abc123; SameSite=Lax; Secure'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'POST',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.sameSiteLaxCrossSite');
	});

	it('should block SameSite=None without Secure', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { sameSite: 'None' },
			hostOnly: true,
			rawLine: 'session=abc123; SameSite=None'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.sameSiteNoneNoSecure');
	});

	it('should allow SameSite=None with Secure on HTTPS cross-site', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { sameSite: 'None', secure: true },
			hostOnly: true,
			rawLine: 'session=abc123; SameSite=None; Secure'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(true);
	});

	it('should check path matching', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { path: '/api' },
			hostOnly: true,
			rawLine: 'session=abc123; Path=/api'
		};

		const context: CookieContext = {
			siteUrl: 'https://example.com',
			requestUrl: 'https://example.com/other',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: false
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.pathMismatch');
	});

	it('should send cookie when domain matches exactly', () => {
		const cookie: ParsedCookie = {
			name: 'api_token',
			value: 'ghi789',
			attrs: { domain: 'api.example.com', secure: true, httpOnly: true, path: '/' },
			hostOnly: false,
			rawLine: 'api_token=ghi789; Domain=api.example.com; Secure; HttpOnly; Path=/'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(true);
		expect(result.reasons).toContain('cookieDebugger.simulation.willBeSent');
		expect(result.reasons).not.toContain('cookieDebugger.simulation.domainMismatch');
	});

	it('should send cookie when request host is subdomain of cookie domain', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { domain: 'example.com', secure: true, path: '/' },
			hostOnly: false,
			rawLine: 'session=abc123; Domain=example.com; Secure; Path=/'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://api.example.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: false
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(true);
		expect(result.reasons).toContain('cookieDebugger.simulation.willBeSent');
	});

	it('should not send cookie when domain does not match', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { domain: 'api.example.com', secure: true, path: '/' },
			hostOnly: false,
			rawLine: 'session=abc123; Domain=api.example.com; Secure; Path=/'
		};

		const context: CookieContext = {
			siteUrl: 'https://app.example.com',
			requestUrl: 'https://other.com/v1/me',
			isHttps: true,
			method: 'GET',
			isTopLevelNavigation: false,
			isIframe: false,
			isCrossSite: true
		};

		const result = canSendCookie(cookie, context);

		expect(result.ok).toBe(false);
		expect(result.reasons).toContain('cookieDebugger.simulation.domainMismatch');
	});
});

describe('deriveContextFromUrls', () => {
	it('should derive context from URLs', () => {
		const context = deriveContextFromUrls(
			'https://app.example.com',
			'https://api.example.com/v1/me',
			'GET',
			false,
			false
		);

		expect(context).toBeDefined();
		expect(context?.isHttps).toBe(true);
		expect(context?.isCrossSite).toBe(true);
	});

	it('should detect same-site', () => {
		const context = deriveContextFromUrls(
			'https://app.example.com',
			'https://app.example.com/api',
			'GET',
			false,
			false
		);

		expect(context?.isCrossSite).toBe(false);
	});
});

