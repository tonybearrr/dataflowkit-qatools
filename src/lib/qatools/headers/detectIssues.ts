import type { ParsedHeader, DetectedIssue, ParsedHeadersResult } from './types';

export function detectIssues(result: ParsedHeadersResult): DetectedIssue[] {
	const issues: DetectedIssue[] = [];
	const headers = result.headers;
	const headerMap = new Map<string, ParsedHeader[]>();

	for (const header of headers) {
		if (!headerMap.has(header.normalizedName)) {
			headerMap.set(header.normalizedName, []);
		}
		headerMap.get(header.normalizedName)!.push(header);
	}

	const getHeader = (name: string): ParsedHeader | undefined => {
		const list = headerMap.get(name.toLowerCase());
		return list?.[0];
	};

	const getHeaderValue = (name: string): string | undefined => {
		return getHeader(name)?.value.toLowerCase();
	};

	const hasHeader = (name: string): boolean => {
		return headerMap.has(name.toLowerCase());
	};

	// CORS Issues
	const acao = getHeaderValue('access-control-allow-origin');
	const acac = getHeaderValue('access-control-allow-credentials');
	const origin = getHeaderValue('origin');

	if (acao === '*' && acac === 'true') {
		issues.push({
			severity: 'error',
			message: 'Invalid CORS configuration: ACAO="*" with ACAC="true"',
			messageKey: 'headersInspector.issues.corsStarWithCredentials',
			whyKey: 'headersInspector.issues.corsStarWithCredentialsWhy',
			headerNames: ['access-control-allow-origin', 'access-control-allow-credentials']
		});
	}

	if (acao && acao !== '*' && acac === 'true' && !hasHeader('vary')) {
		issues.push({
			severity: 'warning',
			message: 'Recommend adding Vary: Origin when using specific ACAO with credentials',
			messageKey: 'headersInspector.issues.corsVaryOrigin',
			whyKey: 'headersInspector.issues.corsVaryOriginWhy',
			headerNames: ['access-control-allow-origin', 'access-control-allow-credentials', 'vary']
		});
	}

	if (result.requestType === 'response' && origin && !acao) {
		issues.push({
			severity: 'warning',
			message: 'CORS request detected but no ACAO header in response',
			messageKey: 'headersInspector.issues.corsMissingAcao',
			whyKey: 'headersInspector.issues.corsMissingAcaoWhy',
			headerNames: ['origin', 'access-control-allow-origin']
		});
	}

	// Cache Issues
	const cacheControl = getHeaderValue('cache-control');
	const etag = hasHeader('etag');

	if (cacheControl?.includes('no-store') && etag) {
		issues.push({
			severity: 'info',
			message: 'Cache-Control: no-store with ETag may be redundant',
			messageKey: 'headersInspector.issues.cacheNoStoreWithEtag',
			whyKey: 'headersInspector.issues.cacheNoStoreWithEtagWhy',
			headerNames: ['cache-control', 'etag']
		});
	}

	const contentType = getHeaderValue('content-type');
	if (contentType?.includes('application/json') && !cacheControl) {
		issues.push({
			severity: 'info',
			message: 'API response (JSON) missing Cache-Control header',
			messageKey: 'headersInspector.issues.cacheMissingForApi',
			whyKey: 'headersInspector.issues.cacheMissingForApiWhy',
			headerNames: ['content-type', 'cache-control']
		});
	}

	// Security Issues
	const xForwardedProto = getHeaderValue('x-forwarded-proto');
	const hsts = hasHeader('strict-transport-security');

	if (xForwardedProto === 'https' && !hsts) {
		issues.push({
			severity: 'info',
			message: 'HTTPS detected but missing HSTS header',
			messageKey: 'headersInspector.issues.securityMissingHsts',
			whyKey: 'headersInspector.issues.securityMissingHstsWhy',
			headerNames: ['x-forwarded-proto', 'strict-transport-security']
		});
	}

	if (contentType?.includes('text/html') && !hasHeader('x-content-type-options')) {
		issues.push({
			severity: 'info',
			message: 'HTML content missing X-Content-Type-Options header',
			messageKey: 'headersInspector.issues.securityMissingXContentType',
			whyKey: 'headersInspector.issues.securityMissingXContentTypeWhy',
			headerNames: ['content-type', 'x-content-type-options']
		});
	}

	// Cookie Issues
	const setCookieHeaders = headerMap.get('set-cookie') || [];
	for (const cookieHeader of setCookieHeaders) {
		const value = cookieHeader.value.toLowerCase();
		const hasSameSiteNone = value.includes('samesite=none');
		const hasSecure = value.includes('secure');

		if (hasSameSiteNone && !hasSecure) {
			issues.push({
				severity: 'error',
				message: 'Set-Cookie: SameSite=None requires Secure flag',
				messageKey: 'headersInspector.issues.cookieSameSiteNoneNoSecure',
				whyKey: 'headersInspector.issues.cookieSameSiteNoneNoSecureWhy',
				headerNames: ['set-cookie']
			});
		}

		// Check for session-like cookies without HttpOnly
		const cookieName = cookieHeader.value.split('=')[0]?.toLowerCase() || '';
		const isSessionLike = /(session|sid|token|auth)/.test(cookieName);
		const hasHttpOnly = value.includes('httponly');

		if (isSessionLike && !hasHttpOnly) {
			issues.push({
				severity: 'warning',
				message: 'Session-like cookie missing HttpOnly flag',
				messageKey: 'headersInspector.issues.cookieMissingHttpOnly',
				whyKey: 'headersInspector.issues.cookieMissingHttpOnlyWhy',
				headerNames: ['set-cookie']
			});
		}
	}

	return issues;
}

