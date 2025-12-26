import type {
	ParsedHeaders,
	ParsedJwt,
	ParsedAuthData,
	AuthAnalysis,
	AuthIssue,
	Severity,
	Confidence,
	IssueSource
} from './types';
import { decodeJwt, extractJwtFromAuth, isJwtExpired, isJwtNotActive } from './jwt';
import { parseCookies } from '$lib/tools/cookies';

type AnalysisMode = 'request' | 'response' | 'combined';

type RuleFunction = (
	data: ParsedAuthData,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) => void;

interface Rule {
	applicableModes: AnalysisMode[];
	source: IssueSource;
	run: RuleFunction;
}

export function analyzeAuth(data: ParsedAuthData, mode: AnalysisMode = 'combined'): AuthAnalysis {
	const issues: AuthIssue[] = [];
	const recommendations: string[] = [];

	// Parse JWT if authorization header exists (only in request/combined mode)
	let jwt: ParsedJwt | null = null;
	if ((mode === 'request' || mode === 'combined') && data.authorization) {
		const token = extractJwtFromAuth(data.authorization);
		if (token) {
			jwt = decodeJwt(token);
			data.jwt = jwt;
		}
	}

	// Define rules with mode gating
	const rules: Rule[] = [
		{
			applicableModes: ['response', 'combined'],
			source: 'response',
			run: (d, i, r, m) => {
				if (d.statusCode === 401) analyze401Response(d, i, r, m);
				if (d.statusCode === 403) analyze403Response(d, i, r, m);
			}
		},
		{
			applicableModes: ['request', 'combined'],
			source: 'request',
			run: (d, i, r, m) => {
				// Only check missing auth when we have 401 status
				if (d.statusCode === 401) {
					analyze401Request(d, jwt, i, r, m);
				}
				// Always check authorization format and security issues
				analyzeAuthorization(d, jwt, i, r, m);
			}
		},
		{
			applicableModes: ['response', 'combined', 'request'],
			source: 'response',
			run: (d, i, r, m) => analyzeCookies(d, i, r, m)
		},
		{
			applicableModes: ['response', 'combined'],
			source: 'response',
			run: (d, i, r, m) => {
				analyzeCors(d, i, r, m);
				analyzeSecurity(d, i, r, m);
			}
		}
	];

	// Run only applicable rules
	for (const rule of rules) {
		if (rule.applicableModes.includes(mode)) {
			rule.run(data, issues, recommendations, mode);
		}
	}

	// Determine summary and severity
	const severity = determineSeverity(issues);
	const summary = generateSummary(data, issues, severity, mode);
	const confidence = determineConfidence(data, issues);

	return {
		summary,
		severity,
		issues,
		recommendations,
		confidence
	};
}

// Response-side 401 analysis (status code + response headers)
function analyze401Response(
	data: ParsedAuthData,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	// WWW-Authenticate header analysis
	const wwwAuth = getHeaderValue(data.responseHeaders, 'www-authenticate');
	if (wwwAuth) {
		issues.push({
			id: 'www-authenticate-present',
			level: 'info',
			title: 'WWW-Authenticate Header Present',
			explanation: `Server indicates authentication scheme: ${wwwAuth}. This helps understand what authentication method is expected.`,
			related: [{ kind: 'header', key: 'www-authenticate' }],
			fix: [
				'Review the WWW-Authenticate header value',
				'Ensure your Authorization header matches the expected scheme',
				'Check if realm or other parameters are required'
			],
			source: 'response'
		});
	}
}

// Request-side 401 analysis (authorization header, JWT)
function analyze401Request(
	data: ParsedAuthData,
	jwt: ParsedJwt | null,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	// Missing Authorization header (only in request/combined mode)
	if (!data.authorization) {
		issues.push({
			id: 'missing-auth-header',
			level: 'error',
			title: 'Missing Authorization Header',
			explanation: 'The request does not include an Authorization header. The server requires authentication to access this resource.',
			related: [{ kind: 'header', key: 'authorization' }],
			fix: [
				'Add Authorization header to the request',
				'Format: Authorization: Bearer <token>',
				'Verify the token is valid and not expired',
				'Check if token needs to be refreshed'
			],
			source: mode === 'combined' ? 'combined' : 'request'
		});
	}

	// JWT-specific issues
	if (jwt) {
		if (isJwtExpired(jwt)) {
			issues.push({
				id: 'jwt-expired',
				level: 'error',
				title: 'JWT Token Expired',
				explanation: `Token expired at ${new Date(jwt.exp! * 1000).toISOString()}. The token is no longer valid.`,
				related: [{ kind: 'jwt' }],
				fix: [
					'Obtain a new token from the authentication endpoint',
					'Implement token refresh logic',
					'Check token expiration before making requests'
				],
				source: mode === 'combined' ? 'combined' : 'request'
			});
		}

		if (isJwtNotActive(jwt)) {
			issues.push({
				id: 'jwt-not-active',
				level: 'error',
				title: 'JWT Token Not Yet Active',
				explanation: `Token is not active until ${new Date(jwt.nbf! * 1000).toISOString()}. The token cannot be used before this time.`,
				related: [{ kind: 'jwt' }],
				fix: [
					'Wait until the token becomes active',
					'Check system clock synchronization',
					'Verify token generation timestamp'
				],
				source: mode === 'combined' ? 'combined' : 'request'
			});
		}
	}

	// Invalid Bearer format
	if (data.authorization && !data.authorization.match(/^Bearer\s+/i)) {
		issues.push({
			id: 'invalid-bearer-format',
			level: 'error',
			title: 'Invalid Authorization Format',
			explanation: 'Authorization header should start with "Bearer " followed by the token. Current format is incorrect.',
			related: [{ kind: 'header', key: 'authorization' }],
			fix: [
				'Format: Authorization: Bearer <token>',
				'Ensure there is a space after "Bearer"',
				'Do not include quotes around the token'
			],
			source: mode === 'combined' ? 'combined' : 'request'
		});
	}
}

// Response-side 403 analysis
function analyze403Response(
	data: ParsedAuthData,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	// 403 is a response status, so this is always response-side
	issues.push({
		id: 'forbidden-response',
		level: 'error',
		title: '403 Forbidden',
		explanation: 'The server understood the request but refuses to authorize it. This typically means insufficient permissions.',
		related: [],
		fix: [
			'Verify user has required role/permission',
			'Check if token contains correct scopes',
			'Contact administrator to grant access',
			'Review resource access policies'
		],
		source: 'response'
	});
}

function analyzeAuthorization(
	data: ParsedAuthData,
	jwt: ParsedJwt | null,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	if (!data.authorization) return;

	if (data.context.requestUrl && data.context.requestUrl.includes('token=')) {
		issues.push({
			id: 'token-in-url',
			level: 'warning',
			title: 'Token in URL',
			explanation: 'Authentication token appears to be in the URL. This is a security risk as URLs are logged and can be leaked.',
			related: [{ kind: 'context', key: 'requestUrl' }],
			fix: [
				'Move token to Authorization header',
				'Never include tokens in URL parameters',
				'Use POST body or headers for sensitive data'
			],
			backendTip: 'Consider rejecting requests with tokens in query parameters',
			source: mode === 'combined' ? 'combined' : 'request'
		});
	}
}

function analyzeCookies(
	data: ParsedAuthData,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	// Analyze Set-Cookie headers (response-side only)
	if (mode === 'response' || mode === 'combined') {
		analyzeSetCookieHeaders(data, issues, mode);
	}

	// Analyze Cookie header (request-side only)
	if (mode === 'request' || mode === 'combined') {
		analyzeRequestCookies(data, issues, mode);
	}
}

function analyzeSetCookieHeaders(
	data: ParsedAuthData,
	issues: AuthIssue[],
	mode: AnalysisMode
) {
	if (data.cookies.setCookie.length === 0) return;

	const cookieLines = data.cookies.setCookie.map(sc => {
		const trimmed = sc.trim();
		if (trimmed.toLowerCase().startsWith('set-cookie:')) {
			return trimmed;
		}
		return `Set-Cookie: ${trimmed}`;
	});
	const parsedCookies = parseCookies(cookieLines.join('\n'), 'set-cookie');

	for (const cookie of parsedCookies.cookies) {
		// Set-Cookie is ALWAYS response-side
		const source: IssueSource = 'response';

		// SameSite=None without Secure (RESPONSE-SIDE ONLY)
		if (cookie.attrs.sameSite === 'None' && !cookie.attrs.secure) {
			issues.push({
				id: `response-cookie-${cookie.name}-samesite-none-no-secure`,
				level: 'error',
				title: `Cookie "${cookie.name}": SameSite=None Requires Secure`,
				explanation: 'Cookies with SameSite=None must also specify the Secure attribute. This cookie will be rejected by browsers.',
				related: [{ kind: 'cookie', key: cookie.name }],
				fix: [
					'Add Secure flag to the Set-Cookie header',
					'Ensure cookie is only sent over HTTPS',
					'Format: Set-Cookie: name=value; SameSite=None; Secure',
					'This must be fixed on the server side'
				],
				source
			});
		}

		// Session cookie without HttpOnly (RESPONSE-SIDE ONLY - WARNING)
		if (cookie.name.toLowerCase().includes('session') && !cookie.attrs.httpOnly) {
			issues.push({
				id: `response-cookie-${cookie.name}-missing-httponly`,
				level: 'warning',
				title: `Cookie "${cookie.name}": Missing HttpOnly Flag`,
				explanation: 'Session cookies should have HttpOnly flag to prevent XSS attacks from accessing them via JavaScript.',
				related: [{ kind: 'cookie', key: cookie.name }],
				fix: [
					'Add HttpOnly flag to the Set-Cookie header on the server',
					'Format: Set-Cookie: name=value; HttpOnly; Secure',
					'Backend should include: Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax',
					'This is a server configuration issue, not client-side'
				],
				source
			});
		}

		// Missing Secure flag (RESPONSE-SIDE ONLY - WARNING)
		if (!cookie.attrs.secure) {
			issues.push({
				id: `response-cookie-${cookie.name}-missing-secure`,
				level: 'warning',
				title: `Cookie "${cookie.name}": Missing Secure Flag`,
				explanation: 'Cookies should have Secure flag to ensure they are only sent over HTTPS.',
				related: [{ kind: 'cookie', key: cookie.name }],
				fix: [
					'Add Secure flag to the Set-Cookie header',
					'Ensure all authentication cookies use HTTPS',
					'Format: Set-Cookie: name=value; Secure',
					'Backend must set this flag in the response'
				],
				source
			});
		}
	}
}

function analyzeRequestCookies(
	data: ParsedAuthData,
	issues: AuthIssue[],
	mode: AnalysisMode
) {
	if (!data.cookies.cookieHeader) return;

	// Parse Cookie header (request-side)
	const parsedCookies = parseCookies(`Cookie: ${data.cookies.cookieHeader}`, 'cookie');
	
	for (const cookie of parsedCookies.cookies) {
		const source: IssueSource = mode === 'combined' ? 'combined' : 'request';

		// Check if session cookie is being sent (REQUEST-SIDE INFO ONLY)
		if (cookie.name.toLowerCase().includes('session')) {
			issues.push({
				id: `request-cookie-${cookie.name}-session`,
				level: 'info',
				title: `Session Cookie "${cookie.name}" Detected in Request`,
				explanation: 'Session cookie is being sent with the request. The Cookie header does not include security flags (HttpOnly, Secure) as they are controlled by the server.',
				related: [{ kind: 'cookie', key: cookie.name }],
				fix: [
					'HttpOnly flag can only be verified in the server\'s Set-Cookie response header',
					'To validate security flags, switch to Response or Combined mode',
					'Check that the server originally set this cookie with: HttpOnly; Secure; SameSite=Lax',
					'Client-side JavaScript cannot read HttpOnly cookies (this is by design)'
				],
				source
			});
		}
	}
}

function analyzeCors(
	data: ParsedAuthData,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	const acao = getHeaderValue(data.responseHeaders, 'access-control-allow-origin');
	const acac = getHeaderValue(data.responseHeaders, 'access-control-allow-credentials');

	// ACAO="*" with ACAC=true
	if (acao === '*' && acac === 'true') {
		issues.push({
			id: 'cors-star-with-credentials',
			level: 'error',
			title: 'Invalid CORS: "*" with Credentials',
			explanation: 'Access-Control-Allow-Origin: * cannot be used with Access-Control-Allow-Credentials: true. Browsers will reject this.',
			related: [
				{ kind: 'header', key: 'access-control-allow-origin' },
				{ kind: 'header', key: 'access-control-allow-credentials' }
			],
			fix: [
				'Set Access-Control-Allow-Origin to a specific origin (not *)',
				'Use the Origin header from the request',
				'Ensure credentials are only sent to trusted origins'
			],
			backendTip: 'Set ACAO to the request Origin header value when ACAC is true',
			source: 'response'
		});
	}

	// Missing Vary: Origin
	if (acao && acao !== '*' && acac === 'true') {
		const vary = getHeaderValue(data.responseHeaders, 'vary');
		if (!vary || !vary.toLowerCase().includes('origin')) {
			issues.push({
				id: 'cors-missing-vary-origin',
				level: 'info',
				title: 'Missing Vary: Origin Header',
				explanation: 'When using specific ACAO with credentials, include Vary: Origin to ensure proper caching behavior.',
				related: [{ kind: 'header', key: 'vary' }],
				fix: [
					'Add Vary: Origin header to the response',
					'This ensures correct caching for different origins'
				],
				source: 'response'
			});
		}
	}
}

function analyzeSecurity(
	data: ParsedAuthData,
	issues: AuthIssue[],
	recommendations: string[],
	mode: AnalysisMode
) {
	// Missing HSTS on auth endpoints
	if (data.context.requestUrl && data.context.requestUrl.includes('/auth')) {
		const hsts = getHeaderValue(data.responseHeaders, 'strict-transport-security');
		if (!hsts) {
			issues.push({
				id: 'missing-hsts',
				level: 'info',
				title: 'Missing HSTS Header',
				explanation: 'Authentication endpoints should include Strict-Transport-Security header to force HTTPS.',
				related: [{ kind: 'header', key: 'strict-transport-security' }],
				fix: [
					'Add Strict-Transport-Security header',
					'Recommended: Strict-Transport-Security: max-age=31536000; includeSubDomains'
				],
				source: 'response'
			});
		}
	}
}

function getHeaderValue(headers: ParsedHeaders, name: string): string | null {
	const value = headers[name.toLowerCase()];
	if (!value) return null;
	if (Array.isArray(value)) return value[0];
	return value;
}

function determineSeverity(issues: AuthIssue[]): Severity {
	if (issues.some(i => i.level === 'error')) return 'error';
	if (issues.some(i => i.level === 'warning')) return 'warning';
	return 'info';
}

function generateSummary(data: ParsedAuthData, issues: AuthIssue[], severity: Severity, mode: AnalysisMode): string {
	const errorCount = issues.filter(i => i.level === 'error').length;
	const warningCount = issues.filter(i => i.level === 'warning').length;
	const infoCount = issues.filter(i => i.level === 'info').length;

	// Handle 401 responses based on mode
	if (data.statusCode === 401) {
		if (mode === 'response') {
			// (Response mode) 401 is just a status, not necessarily an error
			if (errorCount > 0) {
				return `401 Unauthorized response with ${errorCount} configuration issue(s). Review server response headers.`;
			}
			return `401 Unauthorized response received. Server requires authentication. ${infoCount} note(s).`;
		}
		
		if (mode === 'combined') {
			// (Combined mode) correlate request + response
			if (errorCount > 0) {
				return `401 Unauthorized: ${errorCount} critical issue(s) found. Authentication is failing.`;
			}
			return `401 Unauthorized: No critical errors. ${warningCount} warning(s), ${infoCount} note(s).`;
		}
		
		// Request mode
		if (errorCount > 0) {
			return `Request has ${errorCount} authentication issue(s). Fix before sending.`;
		}
		return `Request appears valid. ${warningCount} warning(s) to review.`;
	}

	// Handle 403 responses
	if (data.statusCode === 403) {
		if (mode === 'response') {
			return `403 Forbidden: Server rejected the request. Check response headers for details.`;
		}
		return `403 Forbidden: ${errorCount} issue(s) found. User lacks required permissions.`;
	}

	// No status code or other statuses
	if (issues.length === 0) {
		return 'No authentication issues detected.';
	}

	// If only warnings/info, say "No critical errors"
	if (errorCount === 0 && (warningCount > 0 || infoCount > 0)) {
		return `No critical authentication errors detected. ${warningCount} warning(s) and ${infoCount} recommendation(s) found.`;
	}

	return `${issues.length} authentication issue(s) detected: ${errorCount} error(s), ${warningCount} warning(s).`;
}

function determineConfidence(data: ParsedAuthData, issues: AuthIssue[]): Confidence {
	if (data.statusCode && (data.statusCode === 401 || data.statusCode === 403)) {
		return 'high';
	}
	if (data.authorization || data.cookies.cookieHeader) {
		return 'medium';
	}
	return 'low';
}

