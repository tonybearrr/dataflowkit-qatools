import type { ParsedHeader } from './types';

export interface HeaderIssue {
	type: 'error' | 'warn' | 'info';
	id: string;
	title: string;
	message?: string;
	messageKey?: string;
	related: { headerName: string }[];
	learnMore?: string;
}

export interface HeaderHint {
	tone: 'info' | 'warn';
	text?: string;
	textKey?: string;
}

// Helper: Parse Cache-Control header
export function parseCacheControl(value: string): Record<string, string | true> {
	const directives: Record<string, string | true> = {};
	const parts = value.split(',').map((p) => p.trim());
	
	for (const part of parts) {
		const eqIndex = part.indexOf('=');
		if (eqIndex === -1) {
			directives[part.toLowerCase()] = true;
		} else {
			const key = part.slice(0, eqIndex).trim().toLowerCase();
			const val = part.slice(eqIndex + 1).trim();
			directives[key] = val;
		}
	}
	
	return directives;
}

// Helper: Parse Set-Cookie header
export function parseSetCookie(value: string): {
	name: string;
	value: string;
	attrs: Record<string, string | true>;
} {
	const parts = value.split(';').map((p) => p.trim());
	const [nameValue, ...attrParts] = parts;
	
	const [name, val] = nameValue.split('=').map((s) => s.trim());
	const attrs: Record<string, string | true> = {};
	
	for (const attr of attrParts) {
		const eqIndex = attr.indexOf('=');
		if (eqIndex === -1) {
			attrs[attr.toLowerCase()] = true;
		} else {
			const key = attr.slice(0, eqIndex).trim().toLowerCase();
			const val = attr.slice(eqIndex + 1).trim();
			attrs[key] = val;
		}
	}
	
	return { name: name || '', value: val || '', attrs };
}

// Helper: Get header value (case-insensitive)
export function getHeader(headers: ParsedHeader[], name: string): string | null {
	const normalized = name.toLowerCase();
	const header = headers.find((h) => h.normalizedName === normalized);
	return header?.value || null;
}

// Helper: Get all headers with given name (for Set-Cookie)
export function getAllHeaders(headers: ParsedHeader[], name: string): string[] {
	const normalized = name.toLowerCase();
	return headers.filter((h) => h.normalizedName === normalized).map((h) => h.value);
}

// Main issue analyzer
export function analyzeHeaderIssues(
	headers: ParsedHeader[],
	mode: 'request' | 'response'
): HeaderIssue[] {
	const issues: HeaderIssue[] = [];
	
	const getHeaderValue = (name: string): string | null => getHeader(headers, name);
	const hasHeader = (name: string): boolean => getHeaderValue(name) !== null;
	const getAllHeaderValues = (name: string): string[] => getAllHeaders(headers, name);
	
	// CORS Issues
	const acao = getHeaderValue('access-control-allow-origin');
	const acac = getHeaderValue('access-control-allow-credentials');
	const acah = getHeaderValue('access-control-allow-headers');
	const acam = getHeaderValue('access-control-allow-methods');
	const acrh = getHeaderValue('access-control-request-headers');
	const acrm = getHeaderValue('access-control-request-method');
	const vary = getHeaderValue('vary');
	const origin = getHeaderValue('origin');
	
	// ERROR: ACAO is '*' while ACAC is true
	if (acao?.toLowerCase() === '*' && acac?.toLowerCase() === 'true') {
		issues.push({
			type: 'error',
			id: 'cors-star-with-credentials',
			title: 'Invalid CORS Configuration',
			message: 'Access-Control-Allow-Origin cannot be "*" when Access-Control-Allow-Credentials is "true".',
			related: [
				{ headerName: 'access-control-allow-origin' },
				{ headerName: 'access-control-allow-credentials' }
			],
			learnMore: 'Use a specific origin instead of "*" when credentials are required.'
		});
	}
	
	// WARN: ACAC is true and ACAO is missing OR is '*'
	if (acac?.toLowerCase() === 'true') {
		if (!acao || acao === '*') {
			issues.push({
				type: 'warn',
				id: 'cors-credentials-needs-origin',
				title: 'CORS Credentials Configuration',
				message: 'Access-Control-Allow-Credentials requires a specific origin, not "*".',
				related: [
					{ headerName: 'access-control-allow-credentials' },
					{ headerName: 'access-control-allow-origin' }
				]
			});
		}
	}
	
	// INFO: If ACAO present and Vary missing or doesn't include Origin
	if (acao && acao !== '*' && acac?.toLowerCase() === 'true') {
		const varyLower = vary?.toLowerCase() || '';
		if (!vary || !varyLower.includes('origin')) {
			issues.push({
				type: 'info',
				id: 'cors-vary-origin',
				title: 'CORS Caching Recommendation',
				message: 'Consider adding "Origin" to the Vary header when using specific ACAO with credentials.',
				related: [
					{ headerName: 'access-control-allow-origin' },
					{ headerName: 'vary' }
				]
			});
		}
	}
	
	// WARN: Access-Control-Allow-Headers present but method missing on preflight
	if (mode === 'request' && acrh && acah && !acam) {
		issues.push({
			type: 'warn',
			id: 'cors-preflight-missing-method',
			title: 'CORS Preflight Incomplete',
			message: 'Access-Control-Allow-Methods should be included in preflight responses.',
			related: [
				{ headerName: 'access-control-allow-headers' },
				{ headerName: 'access-control-allow-methods' }
			]
		});
	}
	
	// Cache Issues
	const cacheControl = getHeaderValue('cache-control');
	const etag = getHeaderValue('etag');
	const lastModified = getHeaderValue('last-modified');
	
	if (cacheControl) {
		const cc = parseCacheControl(cacheControl);
		const isPublic = cc.public === true;
		const maxAge = cc['max-age'];
		
		// INFO: Cache-Control has 'public' + 'max-age' but no ETag/Last-Modified
		if (isPublic && maxAge && !etag && !lastModified) {
			issues.push({
				type: 'info',
				id: 'cache-missing-validation',
				title: 'Cache Validation Missing',
				messageKey: 'headersInspector.details.hints.cacheValidationMissing',
				related: [
					{ headerName: 'cache-control' },
					{ headerName: 'etag' }
				]
			});
		}
	}
	
	// WARN: ETag is weak (starts with W/)
	if (etag && etag.startsWith('W/')) {
		issues.push({
			type: 'warn',
			id: 'etag-weak',
			title: 'Weak ETag Detected',
			message: 'Weak ETag (W/) may not be suitable for strong validation.',
			related: [{ headerName: 'etag' }]
		});
	}
	
	// Cookie Issues
	const setCookieHeaders = getAllHeaderValues('set-cookie');
	
	for (const cookieValue of setCookieHeaders) {
		const parsed = parseSetCookie(cookieValue);
		
		// ERROR: SameSite=None without Secure
		if (parsed.attrs.samesite?.toString().toLowerCase() === 'none' && parsed.attrs.secure !== true) {
			issues.push({
				type: 'error',
				id: 'cookie-samesite-none-no-secure',
				title: 'Cookie Security Issue',
				message: 'SameSite=None requires the Secure flag.',
				related: [{ headerName: 'set-cookie' }],
				learnMore: 'Cookies with SameSite=None must be marked Secure to prevent interception.'
			});
		}
		
		// INFO: Set-Cookie has no SameSite
		if (!parsed.attrs.samesite) {
			issues.push({
				type: 'info',
				id: 'cookie-missing-samesite',
				title: 'Cookie SameSite Missing',
				message: 'Consider explicitly setting SameSite (Lax, Strict, or None with Secure).',
				related: [{ headerName: 'set-cookie' }]
			});
		}
	}
	
	// Content Issues
	const contentType = getHeaderValue('content-type');
	
	// WARN: Content-Type is application/json but charset missing (optional, keep as INFO)
	if (contentType?.toLowerCase().includes('application/json') && !contentType.includes('charset')) {
		issues.push({
			type: 'info',
			id: 'content-type-missing-charset',
			title: 'Content-Type Charset',
			message: 'JSON typically doesn\'t need charset, but consider adding it for clarity.',
			related: [{ headerName: 'content-type' }]
		});
	}
	
	return issues;
}

// Get smart hint for selected header
export function getHeaderHint(
	selectedHeader: ParsedHeader | null,
	allHeaders: ParsedHeader[],
	mode: 'request' | 'response'
): HeaderHint | null {
	if (!selectedHeader) return null;
	
	const getHeaderValue = (name: string): string | null => getHeader(allHeaders, name);
	const hasHeader = (name: string): boolean => getHeaderValue(name) !== null;
	const normalized = selectedHeader.normalizedName;
	
	// Access-Control-Allow-Origin
	if (normalized === 'access-control-allow-origin') {
		const acao = selectedHeader.value;
		const acac = getHeaderValue('access-control-allow-credentials');
		
		if (acao === '*' && acac?.toLowerCase() === 'true') {
			return {
				tone: 'warn',
				textKey: 'headersInspector.details.hints.cannotUseStarWithCredentials'
			};
		}
	}
	
	// Access-Control-Allow-Credentials
	if (normalized === 'access-control-allow-credentials') {
		const acac = selectedHeader.value;
		const acao = getHeaderValue('access-control-allow-origin');
		
		if (acac?.toLowerCase() === 'true') {
			if (!acao || acao === '*') {
				return {
					tone: 'warn',
					textKey: 'headersInspector.details.hints.requiresSpecificAcao'
				};
			}
			const vary = getHeaderValue('vary');
			if (!vary || !vary.toLowerCase().includes('origin')) {
				return {
					tone: 'info',
					text: 'Consider adding "Origin" to the Vary header for proper caching.'
				};
			}
		}
	}
	
	// Vary
	if (normalized === 'vary') {
		const vary = selectedHeader.value.toLowerCase();
		const acao = getHeaderValue('access-control-allow-origin');
		const acac = getHeaderValue('access-control-allow-credentials');
		
		if (acao && acao !== '*' && acac?.toLowerCase() === 'true' && !vary.includes('origin')) {
			return {
				tone: 'info',
				text: 'Add "Origin" to Vary when using specific ACAO with credentials.'
			};
		}
	}
	
	// Cache-Control
	if (normalized === 'cache-control') {
		const cc = parseCacheControl(selectedHeader.value);
		const maxAge = cc['max-age'];
		const etag = hasHeader('etag');
		const lastModified = hasHeader('last-modified');
		
		if (maxAge && !etag && !lastModified) {
			return {
				tone: 'info',
				textKey: 'headersInspector.details.hints.cacheValidationMissing'
			};
		}
	}
	
	// Set-Cookie
	if (normalized === 'set-cookie') {
		const parsed = parseSetCookie(selectedHeader.value);
		
		if (parsed.attrs.samesite?.toString().toLowerCase() === 'none' && parsed.attrs.secure !== true) {
			return {
				tone: 'warn',
				textKey: 'headersInspector.details.hints.sameSiteNoneSecure'
			};
		}
		
		if (!parsed.attrs.samesite) {
			return {
				tone: 'info',
				text: 'Consider explicitly setting SameSite (Lax, Strict, or None with Secure).'
			};
		}
	}
	
	// ETag
	if (normalized === 'etag') {
		const etag = selectedHeader.value;
		const cacheControl = getHeaderValue('cache-control');
		
		if (etag.startsWith('W/')) {
			return {
				tone: 'warn',
				text: 'Weak ETag may not be suitable for strong validation.'
			};
		}
		
		if (cacheControl) {
			const cc = parseCacheControl(cacheControl);
			if (!cc['max-age'] && !cc['no-cache']) {
				return {
					tone: 'info',
					text: 'ETag works best with Cache-Control max-age for validation caching.'
				};
			}
		}
	}
	
	return null;
}

