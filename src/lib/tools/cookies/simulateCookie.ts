import type { ParsedCookie, CookieContext, CookieSendResult } from './types';

export function canSendCookie(cookie: ParsedCookie, context: CookieContext): CookieSendResult {
	const reasons: string[] = [];
	const warnings: string[] = [];

	// Check Secure flag
	if (cookie.attrs.secure && !context.isHttps) {
		return {
			ok: false,
			reasons: ['cookieDebugger.simulation.secureNotHttps'],
			warnings: []
		};
	}

	// Check expiration
	if (cookie.attrs.expires instanceof Date) {
		if (cookie.attrs.expires.getTime() < Date.now()) {
			return {
				ok: false,
				reasons: ['cookieDebugger.simulation.expired'],
				warnings: []
			};
		}
	}
	if (cookie.attrs.maxAge !== undefined) {
		// Max-Age is relative to when cookie was set, we can't know that
		// So we only check if it's explicitly 0 or negative
		if (cookie.attrs.maxAge <= 0) {
			return {
				ok: false,
				reasons: ['cookieDebugger.simulation.maxAgeZero'],
				warnings: []
			};
		}
	}

	// Check Domain match
	if (!matchesDomain(cookie, context.requestUrl)) {
		return {
			ok: false,
			reasons: ['cookieDebugger.simulation.domainMismatch'],
			warnings: []
		};
	}

	// Check Path match
	if (!matchesPath(cookie, context.requestUrl)) {
		return {
			ok: false,
			reasons: ['cookieDebugger.simulation.pathMismatch'],
			warnings: []
		};
	}

	// Check SameSite
	const sameSiteResult = checkSameSite(cookie, context);
	if (!sameSiteResult.ok) {
		return {
			ok: false,
			reasons: sameSiteResult.reasons,
			warnings: sameSiteResult.warnings
		};
	}
	warnings.push(...sameSiteResult.warnings);

	// All checks passed
	return {
		ok: true,
		reasons: ['cookieDebugger.simulation.willBeSent'],
		warnings
	};
}

function matchesDomain(cookie: ParsedCookie, requestUrl: string): boolean {
	try {
		const requestHost = new URL(requestUrl).hostname.toLowerCase();

		if (cookie.hostOnly) {
			// Host-only cookie: Domain attribute is NOT present
			// For simulation, we can't know the exact host that set it,
			// but we can assume it matches if there's no domain mismatch
			// In practice, host-only cookies are sent to the exact host that set them
			// Since we don't track the setting host, we'll be permissive here
			// and let other checks (path, secure, etc.) handle blocking
			return true;
		}

		// Domain attribute is present
		if (!cookie.attrs.domain) {
			// This shouldn't happen if hostOnly is false, but handle it
			return true;
		}

		// Domain is already normalized during parsing
		const cookieDomain = cookie.attrs.domain;

		// Exact match
		if (requestHost === cookieDomain) {
			return true;
		}

		// Subdomain match - request host ends with .domain
		if (requestHost.endsWith('.' + cookieDomain)) {
			return true;
		}

		return false;
	} catch {
		return false;
	}
}

function matchesPath(cookie: ParsedCookie, requestUrl: string): boolean {
	try {
		const requestPath = new URL(requestUrl).pathname;
		const cookiePath = cookie.attrs.path || '/';

		// Path must be a prefix of request path
		return requestPath.startsWith(cookiePath);
	} catch {
		return false;
	}
}

function checkSameSite(
	cookie: ParsedCookie,
	context: CookieContext
): { ok: boolean; reasons: string[]; warnings: string[] } {
	const reasons: string[] = [];
	const warnings: string[] = [];

	const sameSite = cookie.attrs.sameSite || 'Lax'; // Default is Lax

	if (context.isCrossSite) {
		// Cross-site request
		if (sameSite === 'Strict') {
			return {
				ok: false,
				reasons: ['cookieDebugger.simulation.sameSiteStrictCrossSite'],
				warnings: []
			};
		}

		if (sameSite === 'Lax') {
			// Lax -only sent on top-level navigation GET
			if (context.isTopLevelNavigation && context.method === 'GET') {
				return { ok: true, reasons: [], warnings: [] };
			}
			return {
				ok: false,
				reasons: ['cookieDebugger.simulation.sameSiteLaxCrossSite'],
				warnings: []
			};
		}

		if (sameSite === 'None') {
			// !requires Secure flag
			if (!cookie.attrs.secure) {
				return {
					ok: false,
					reasons: ['cookieDebugger.simulation.sameSiteNoneNoSecure'],
					warnings: []
				};
			}
			if (!context.isHttps) {
				return {
					ok: false,
					reasons: ['cookieDebugger.simulation.sameSiteNoneNotHttps'],
					warnings: []
				};
			}
			return { ok: true, reasons: [], warnings: [] };
		}
	} else {
		// Same-site request
		// All SameSite values allow same-site requests
		return { ok: true, reasons: [], warnings: [] };
	}

	return { ok: true, reasons: [], warnings: [] };
}

export function deriveContextFromUrls(
	siteUrl: string,
	requestUrl: string,
	method: CookieContext['method'] = 'GET',
	isTopLevelNavigation: boolean = false,
	isIframe: boolean = false
): CookieContext | null {
	try {
		const siteUrlObj = new URL(siteUrl);
		const requestUrlObj = new URL(requestUrl);

		const isHttps = requestUrlObj.protocol === 'https:';
		const isCrossSite = !isSameSite(siteUrlObj.hostname, requestUrlObj.hostname);

		return {
			siteUrl,
			requestUrl,
			isHttps,
			method,
			isTopLevelNavigation,
			isIframe,
			isCrossSite
		};
	} catch {
		return null;
	}
}

function isSameSite(host1: string, host2: string): boolean {
	// Simple hostname-based same-site detection
	// (For MVP) exact match or same registrable domain
	if (host1 === host2) return true;

	const domain1 = getRegistrableDomain(host1);
	const domain2 = getRegistrableDomain(host2);

	return domain1 === domain2;
}

function getRegistrableDomain(hostname: string): string {
	const parts = hostname.split('.');
	if (parts.length >= 2) {
		return parts.slice(-2).join('.');
	}
	return hostname;
}

