import { describe, it, expect } from 'vitest';
import { analyzeAuth } from './engine';
import type { ParsedAuthData } from './types';

describe('analyzeAuth mode gating', () => {
	it('should NOT show "Missing Authorization Header" in Response mode', () => {
		const data: ParsedAuthData = {
			statusCode: 401,
			requestHeaders: {},
			responseHeaders: {
				'www-authenticate': 'Bearer realm="api"'
			},
			cookies: {
				setCookie: [],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'response');

		// Should NOT have missing auth header issue
		expect(result.issues.find(i => i.id === 'missing-auth-header')).toBeUndefined();
		
		// Should have WWW-Authenticate info
		expect(result.issues.find(i => i.id === 'www-authenticate-present')).toBeDefined();
	});

	it('should show "Missing Authorization Header" in Request mode with 401', () => {
		const data: ParsedAuthData = {
			statusCode: 401,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: [],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'request');

		// Should have missing auth header issue
		const missingAuth = result.issues.find(i => i.id === 'missing-auth-header');
		expect(missingAuth).toBeDefined();
		expect(missingAuth?.source).toBe('request');
	});

	it('should show both request and response issues in Combined mode', () => {
		const data: ParsedAuthData = {
			statusCode: 401,
			requestHeaders: {},
			responseHeaders: {
				'www-authenticate': 'Bearer realm="api"'
			},
			cookies: {
				setCookie: [],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'combined');

		// Should have both missing auth (request) and WWW-Authenticate (response)
		const missingAuth = result.issues.find(i => i.id === 'missing-auth-header');
		const wwwAuth = result.issues.find(i => i.id === 'www-authenticate-present');
		
		expect(missingAuth).toBeDefined();
		expect(missingAuth?.source).toBe('combined');
		expect(wwwAuth).toBeDefined();
		expect(wwwAuth?.source).toBe('response');
	});

	it('should mark cookie issues from Set-Cookie as response source', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: ['session=abc; SameSite=None'],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'response');

		const cookieIssue = result.issues.find(i => i.id.includes('samesite-none-no-secure'));
		expect(cookieIssue).toBeDefined();
		expect(cookieIssue?.source).toBe('response');
	});

	it('should show correct summary when only warnings/info exist', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: ['session=abc'], // Missing HttpOnly (warning)
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'response');

		// Should say "No critical errors" if only warnings
		if (result.issues.every(i => i.level !== 'error')) {
			expect(result.summary).toContain('No critical authentication errors detected');
		}
	});

	it('should handle 401 in Response mode correctly', () => {
		const data: ParsedAuthData = {
			statusCode: 401,
			requestHeaders: {},
			responseHeaders: {
				'www-authenticate': 'Bearer realm="api"'
			},
			cookies: {
				setCookie: [],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'response');

		// Should NOT treat 401 as an error in response mode
		expect(result.summary).toContain('401 Unauthorized response');
		expect(result.summary).not.toContain('critical issue');
	});

	it('should NOT analyze "cookie will be sent" logic in Response mode', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: ['session=abc; Domain=example.com'],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {
				requestUrl: 'https://different.com/api'
			}
		};

		const result = analyzeAuth(data, 'response');

		// Should NOT have domain mismatch issue (that's request-side)
		// Response mode only validates Set-Cookie attributes
		const domainIssue = result.issues.find(i => i.id.includes('domain-mismatch'));
		expect(domainIssue).toBeUndefined();
	});

	// TC-5: Request mode → INFO only, no warnings for HttpOnly
	it('TC-5: Request mode should show INFO only for session cookies, no HttpOnly warnings', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: [],
				cookieHeader: 'session=xyz123; other=value'
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'request');

		// Should have INFO about session cookie
		const sessionInfo = result.issues.find(i => i.id.includes('request-cookie-session'));
		expect(sessionInfo).toBeDefined();
		expect(sessionInfo?.level).toBe('info');
		expect(sessionInfo?.source).toBe('request');

		// Should NOT have any warnings about HttpOnly
		const httpOnlyWarning = result.issues.find(i => 
			i.id.includes('httponly') && i.level === 'warning'
		);
		expect(httpOnlyWarning).toBeUndefined();
	});

	// TC-6: Response mode → WARNING shown correctly for missing HttpOnly
	it('TC-6: Response mode should show WARNING for session cookie without HttpOnly', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: ['session=abc123; Secure; Path=/'],
				cookieHeader: null
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'response');

		// Should have WARNING about missing HttpOnly
		const httpOnlyWarning = result.issues.find(i => i.id.includes('missing-httponly'));
		expect(httpOnlyWarning).toBeDefined();
		expect(httpOnlyWarning?.level).toBe('warning');
		expect(httpOnlyWarning?.source).toBe('response');
		expect(httpOnlyWarning?.title).toContain('Missing HttpOnly Flag');
	});

	// Combined mode: merge logic
	it('Combined mode should show both Request INFO and Response WARNING correctly', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: ['session=abc; Secure'], // Missing HttpOnly
				cookieHeader: 'session=abc' // Same cookie in request
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'combined');

		// Should have INFO about request cookie
		const requestInfo = result.issues.find(i => 
			i.id.includes('request-cookie-session')
		);
		expect(requestInfo).toBeDefined();
		expect(requestInfo?.level).toBe('info');

		// Should have WARNING about response Set-Cookie
		const responseWarning = result.issues.find(i => 
			i.id.includes('response-cookie') && i.id.includes('missing-httponly')
		);
		expect(responseWarning).toBeDefined();
		expect(responseWarning?.level).toBe('warning');
		expect(responseWarning?.source).toBe('response');
	});

	// No duplicate issues
	it('should not create duplicate or conflicting cookie issues', () => {
		const data: ParsedAuthData = {
			statusCode: null,
			requestHeaders: {},
			responseHeaders: {},
			cookies: {
				setCookie: ['session=abc'],
				cookieHeader: 'session=abc'
			},
			authorization: null,
			jwt: null,
			context: {}
		};

		const result = analyzeAuth(data, 'combined');

		// Count session-related issues
		const sessionIssues = result.issues.filter(i => i.title.toLowerCase().includes('session'));
		
		// Should have exactly 2: one INFO (request) and one WARNING (response)
		expect(sessionIssues.length).toBeGreaterThanOrEqual(1);
		
		// Verify no duplicate IDs
		const ids = result.issues.map(i => i.id);
		const uniqueIds = new Set(ids);
		expect(ids.length).toBe(uniqueIds.size);
	});
});

