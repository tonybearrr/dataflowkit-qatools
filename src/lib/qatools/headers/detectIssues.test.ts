import { describe, it, expect } from 'vitest';
import { parseHeaders } from './parseHeaders';
import { detectIssues } from './detectIssues';

describe('detectIssues', () => {
	it('should detect CORS star with credentials error', () => {
		const input = `Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true`;
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const error = issues.find((i) => i.severity === 'error');
		expect(error).toBeDefined();
		expect(error?.messageKey).toBe('headers.issues.corsStarWithCredentials');
	});

	it('should detect SameSite=None without Secure error', () => {
		const input = 'Set-Cookie: session=abc; SameSite=None';
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const error = issues.find((i) => i.severity === 'error');
		expect(error).toBeDefined();
		expect(error?.messageKey).toBe('headers.issues.cookieSameSiteNoneNoSecure');
	});

	it('should detect missing HttpOnly for session cookies', () => {
		const input = 'Set-Cookie: session_id=abc123; Secure';
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const warning = issues.find((i) => i.severity === 'warning');
		expect(warning).toBeDefined();
		expect(warning?.messageKey).toBe('headers.issues.cookieMissingHttpOnly');
	});

	it('should recommend Vary: Origin for specific ACAO with credentials', () => {
		const input = `Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true`;
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const warning = issues.find((i) => i.messageKey === 'headers.issues.corsVaryOrigin');
		expect(warning).toBeDefined();
	});

	it('should detect missing Cache-Control for JSON API responses', () => {
		const input = 'Content-Type: application/json';
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const info = issues.find((i) => i.messageKey === 'headers.issues.cacheMissingForApi');
		expect(info).toBeDefined();
	});

	it('should detect no-store with ETag redundancy', () => {
		const input = `Cache-Control: no-store
ETag: "abc123"`;
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const info = issues.find((i) => i.messageKey === 'headers.issues.cacheNoStoreWithEtag');
		expect(info).toBeDefined();
	});

	it('should detect missing HSTS when HTTPS is detected', () => {
		const input = 'X-Forwarded-Proto: https';
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const info = issues.find((i) => i.messageKey === 'headers.issues.securityMissingHsts');
		expect(info).toBeDefined();
	});

	it('should detect missing X-Content-Type-Options for HTML', () => {
		const input = 'Content-Type: text/html';
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		expect(issues.length).toBeGreaterThan(0);
		const info = issues.find((i) => i.messageKey === 'headers.issues.securityMissingXContentType');
		expect(info).toBeDefined();
	});

	it('should not detect issues for valid headers', () => {
		const input = `Content-Type: application/json
Cache-Control: no-cache
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict`;
		const result = parseHeaders(input, 'response');
		const issues = detectIssues(result);

		// Should only have info about missing Cache-Control for API
		const errors = issues.filter((i) => i.severity === 'error');
		expect(errors).toHaveLength(0);
	});
});

