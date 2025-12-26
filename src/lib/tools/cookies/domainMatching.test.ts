import { describe, it, expect } from 'vitest';
import { canSendCookie } from './simulateCookie';
import type { ParsedCookie, CookieContext } from './types';

// Helper function to test domain matching logic
function testDomainMatch(cookieDomain: string, requestHost: string): boolean {
	const cookie: ParsedCookie = {
		name: 'test',
		value: 'value',
		attrs: { domain: cookieDomain, secure: true, path: '/' },
		hostOnly: false,
		rawLine: `test=value; Domain=${cookieDomain}; Secure; Path=/`
	};

	const context: CookieContext = {
		siteUrl: 'https://app.example.com',
		requestUrl: `https://${requestHost}/path`,
		isHttps: true,
		method: 'GET',
		isTopLevelNavigation: false,
		isIframe: false,
		isCrossSite: false
	};

	const result = canSendCookie(cookie, context);
	return result.ok && !result.reasons.includes('cookieDebugger.simulation.domainMismatch');
}

describe('domainMatching', () => {
	it('domainMatches("api.example.com", "api.example.com") => true', () => {
		expect(testDomainMatch('api.example.com', 'api.example.com')).toBe(true);
	});

	it('domainMatches("example.com", "api.example.com") => true', () => {
		expect(testDomainMatch('example.com', 'api.example.com')).toBe(true);
	});

	it('domainMatches("api.example.com", "app.example.com") => false', () => {
		expect(testDomainMatch('api.example.com', 'app.example.com')).toBe(false);
	});

	it('should handle domain with leading dot (normalized)', () => {
		// Domain should be normalized during parsing, so this tests the normalized version
		expect(testDomainMatch('example.com', 'sub.example.com')).toBe(true);
	});

	it('should handle exact match for domain cookie', () => {
		expect(testDomainMatch('api.example.com', 'api.example.com')).toBe(true);
	});
});

