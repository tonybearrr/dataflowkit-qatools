import type { ParsedHeaders, ParsedCookies, ParsedAuthData, AuthContext } from './types';

export function parseHttpDump(
	rawText: string,
	mode: 'request' | 'response' | 'combined' = 'combined',
	context: AuthContext = {}
): ParsedAuthData {
	const lines = rawText.split('\n');
	let statusCode: number | null = null;
	const requestHeaders: ParsedHeaders = {};
	const responseHeaders: ParsedHeaders = {};
	const setCookieHeaders: string[] = [];
	let cookieHeader: string | null = null;
	let authorization: string | null = null;

	let currentSection: 'request' | 'response' | 'unknown' = 'unknown';
	let inHeaders = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// Detect HTTP status line
		const statusMatch = line.match(/^HTTP\/[\d.]+ (\d{3})/i);
		if (statusMatch) {
			statusCode = parseInt(statusMatch[1], 10);
			currentSection = 'response';
			inHeaders = true;
			continue;
		}

		// Detect section markers
		if (line.toLowerCase().includes('request headers') || line.toLowerCase().includes('request:')) {
			currentSection = 'request';
			inHeaders = true;
			continue;
		}
		if (line.toLowerCase().includes('response headers') || line.toLowerCase().includes('response:')) {
			currentSection = 'response';
			inHeaders = true;
			continue;
		}

		// Skip non-header lines if we haven't detected headers yet
		if (!inHeaders && !line.includes(':')) {
			continue;
		}

		// Parse header line
		const colonIndex = line.indexOf(':');
		if (colonIndex === -1) continue;

		const headerName = line.slice(0, colonIndex).trim().toLowerCase();
		const headerValue = line.slice(colonIndex + 1).trim();

		// Determine which headers object to use
		let targetHeaders: ParsedHeaders;
		if (mode === 'request') {
			targetHeaders = requestHeaders;
		} else if (mode === 'response') {
			targetHeaders = responseHeaders;
		} else {
			// (Combined mode) use currentSection
			targetHeaders = currentSection === 'request' ? requestHeaders : responseHeaders;
		}

		// Handle special headers
		if (headerName === 'set-cookie') {
			setCookieHeaders.push(headerValue);
			continue;
		}

		if (headerName === 'cookie') {
			cookieHeader = headerValue;
			continue;
		}

		if (headerName === 'authorization') {
			authorization = headerValue;
			addHeader(targetHeaders, headerName, headerValue);
			continue;
		}

		addHeader(targetHeaders, headerName, headerValue);
	}

	return {
		statusCode,
		requestHeaders,
		responseHeaders,
		cookies: {
			setCookie: setCookieHeaders,
			cookieHeader
		},
		authorization,
		jwt: null,
		context
	};
}

function addHeader(headers: ParsedHeaders, name: string, value: string) {
	const existing = headers[name];
	if (existing === undefined) {
		headers[name] = value;
	} else if (Array.isArray(existing)) {
		existing.push(value);
	} else {
		headers[name] = [existing, value];
	}
}


 //Extract Authorization header value from parsed headers
export function extractAuthorization(headers: ParsedHeaders): string | null {
	const auth = headers['authorization'] || headers['Authorization'];
	if (!auth) return null;
	if (Array.isArray(auth)) return auth[0];
	return auth;
}

 //Extract Cookie header value from parsed headers
export function extractCookieHeader(headers: ParsedHeaders): string | null {
	const cookie = headers['cookie'] || headers['Cookie'];
	if (!cookie) return null;
	if (Array.isArray(cookie)) return cookie[0];
	return cookie;
}

 //Extract Set-Cookie headers from response headers
export function extractSetCookieHeaders(headers: ParsedHeaders): string[] {
	const setCookie = headers['set-cookie'] || headers['Set-Cookie'];
	if (!setCookie) return [];
	if (Array.isArray(setCookie)) return setCookie;
	return [setCookie];
}

