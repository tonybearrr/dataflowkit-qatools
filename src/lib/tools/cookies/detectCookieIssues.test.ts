import { describe, it, expect } from 'vitest';
import { detectCookieIssues, detectDomainMismatch } from './detectCookieIssues';
import type { ParsedCookie } from './types';

describe('detectCookieIssues', () => {
	it('should detect SameSite=None without Secure', () => {
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: { sameSite: 'None' },
			hostOnly: true,
			rawLine: 'session=abc123; SameSite=None'
		}];

		const issues = detectCookieIssues(cookies);
		const error = issues.find(i => i.id.includes('samesite-none-no-secure'));

		expect(error).toBeDefined();
		expect(error?.type).toBe('error');
	});

	it('should detect missing SameSite attribute', () => {
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: {},
			hostOnly: true,
			rawLine: 'session=abc123'
		}];

		const issues = detectCookieIssues(cookies);
		const info = issues.find(i => i.id.includes('no-samesite'));

		expect(info).toBeDefined();
		expect(info?.type).toBe('info');
	});

	it('should detect expired cookie', () => {
		const pastDate = new Date('2020-01-01');
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: { expires: pastDate },
			hostOnly: true,
			rawLine: 'session=abc123; Expires=Wed, 01 Jan 2020 00:00:00 GMT'
		}];

		const issues = detectCookieIssues(cookies);
		const expired = issues.find(i => i.id.includes('expired'));

		expect(expired).toBeDefined();
		expect(expired?.type).toBe('info');
	});

	it('should detect Max-Age=0', () => {
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: { maxAge: 0 },
			hostOnly: true,
			rawLine: 'session=abc123; Max-Age=0'
		}];

		const issues = detectCookieIssues(cookies);
		const maxAge = issues.find(i => i.id.includes('maxage-zero'));

		expect(maxAge).toBeDefined();
		expect(maxAge?.type).toBe('info');
	});

	it('should detect missing HttpOnly for session-like cookies', () => {
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: {},
			hostOnly: true,
			rawLine: 'session=abc123'
		}];

		const issues = detectCookieIssues(cookies);
		const missing = issues.find(i => i.id.includes('missing-httponly'));

		expect(missing).toBeDefined();
		expect(missing?.type).toBe('info');
	});

	it('should detect both Expires and Max-Age', () => {
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: { expires: new Date(), maxAge: 3600 },
			hostOnly: true,
			rawLine: 'session=abc123; Expires=...; Max-Age=3600'
		}];

		const issues = detectCookieIssues(cookies);
		const both = issues.find(i => i.id.includes('both-expires-maxage'));

		expect(both).toBeDefined();
		expect(both?.type).toBe('info');
	});

	it('should detect missing Path', () => {
		const cookies: ParsedCookie[] = [{
			name: 'session',
			value: 'abc123',
			attrs: {},
			hostOnly: true,
			rawLine: 'session=abc123'
		}];

		const issues = detectCookieIssues(cookies);
		const noPath = issues.find(i => i.id.includes('no-path'));

		expect(noPath).toBeDefined();
		expect(noPath?.type).toBe('info');
	});
});

describe('detectDomainMismatch', () => {
	it('should detect domain mismatch', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { domain: 'api.example.com' },
			hostOnly: false,
			rawLine: 'session=abc123; Domain=api.example.com'
		};

		const issue = detectDomainMismatch(cookie, 'https://app.example.com');

		expect(issue).toBeDefined();
		expect(issue?.type).toBe('warn');
	});

	it('should not detect mismatch for matching domains', () => {
		const cookie: ParsedCookie = {
			name: 'session',
			value: 'abc123',
			attrs: { domain: 'example.com' },
			hostOnly: false,
			rawLine: 'session=abc123; Domain=example.com'
		};

		const issue = detectDomainMismatch(cookie, 'https://app.example.com');

		expect(issue).toBeNull();
	});
});

