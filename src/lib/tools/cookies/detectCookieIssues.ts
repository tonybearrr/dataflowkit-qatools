import type { ParsedCookie, CookieIssue } from './types';

export function detectCookieIssues(cookies: ParsedCookie[]): CookieIssue[] {
	const issues: CookieIssue[] = [];
	const seenIds = new Set<string>();

	for (const cookie of cookies) {
		// ERROR: SameSite=None without Secure
		if (cookie.attrs.sameSite === 'None' && cookie.attrs.secure !== true) {
			const id = `cookie-${cookie.name}-samesite-none-no-secure`;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				issues.push({
					type: 'error',
					id,
					title: 'SameSite=None requires Secure',
					messageKey: 'cookieDebugger.issues.sameSiteNoneNoSecure',
					relatedCookieName: cookie.name,
					relatedAttribute: 'SameSite'
				});
			}
		}

		// WARN: Domain is an IP or invalid format
		if (cookie.attrs.domain) {
			const domain = cookie.attrs.domain;
			// Basic heuristic: IP address or invalid domain
			if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
				const id = `cookie-${cookie.name}-domain-ip`;
				if (!seenIds.has(id)) {
					seenIds.add(id);
					issues.push({
						type: 'warn',
						id,
						title: 'Domain is an IP address',
						messageKey: 'cookieDebugger.issues.domainIsIp',
						relatedCookieName: cookie.name,
						relatedAttribute: 'Domain'
					});
				}
			} else if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(domain)) {
				// Basic domain format check
				const id = `cookie-${cookie.name}-domain-invalid`;
				if (!seenIds.has(id)) {
					seenIds.add(id);
					issues.push({
						type: 'warn',
						id,
						title: 'Invalid domain format',
						messageKey: 'cookieDebugger.issues.domainInvalid',
						relatedCookieName: cookie.name,
						relatedAttribute: 'Domain'
					});
				}
			}
		}

		// INFO: No SameSite set
		if (!cookie.attrs.sameSite) {
			const id = `cookie-${cookie.name}-no-samesite`;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				issues.push({
					type: 'info',
					id,
					title: 'SameSite not set',
					messageKey: 'cookieDebugger.issues.noSameSite',
					relatedCookieName: cookie.name,
					relatedAttribute: 'SameSite'
				});
			}
		}

		// INFO/WARN: Expires in the past OR Max-Age=0
		if (cookie.attrs.expires instanceof Date) {
			if (cookie.attrs.expires.getTime() < Date.now()) {
				const id = `cookie-${cookie.name}-expired`;
				if (!seenIds.has(id)) {
					seenIds.add(id);
					issues.push({
						type: 'info',
						id,
						title: 'Cookie expired',
						messageKey: 'cookieDebugger.issues.expired',
						relatedCookieName: cookie.name,
						relatedAttribute: 'Expires'
					});
				}
			}
		}
		if (cookie.attrs.maxAge !== undefined && cookie.attrs.maxAge <= 0) {
			const id = `cookie-${cookie.name}-maxage-zero`;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				issues.push({
					type: 'info',
					id,
					title: 'Max-Age is zero or negative',
					messageKey: 'cookieDebugger.issues.maxAgeZero',
					relatedCookieName: cookie.name,
					relatedAttribute: 'Max-Age'
				});
			}
		}

		// INFO: HttpOnly missing for session-like cookie names
		const sessionLikePattern = /^(sid|session|token|auth|jwt|csrf)/i;
		if (sessionLikePattern.test(cookie.name) && !cookie.attrs.httpOnly) {
			const id = `cookie-${cookie.name}-missing-httponly`;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				issues.push({
					type: 'info',
					id,
					title: 'Session-like cookie missing HttpOnly',
					messageKey: 'cookieDebugger.issues.missingHttpOnly',
					relatedCookieName: cookie.name,
					relatedAttribute: 'HttpOnly'
				});
			}
		}

		// INFO: Using both Expires and Max-Age
		if (cookie.attrs.expires && cookie.attrs.maxAge !== undefined) {
			const id = `cookie-${cookie.name}-both-expires-maxage`;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				issues.push({
					type: 'info',
					id,
					title: 'Both Expires and Max-Age set',
					messageKey: 'cookieDebugger.issues.bothExpiresMaxAge',
					relatedCookieName: cookie.name,
					relatedAttribute: 'Expires'
				});
			}
		}

		// INFO: Path is missing
		if (!cookie.attrs.path) {
			const id = `cookie-${cookie.name}-no-path`;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				issues.push({
					type: 'info',
					id,
					title: 'Path not set',
					messageKey: 'cookieDebugger.issues.noPath',
					relatedCookieName: cookie.name,
					relatedAttribute: 'Path'
				});
			}
		}
	}

	return issues;
}

export function detectDomainMismatch(
	cookie: ParsedCookie,
	siteUrl: string
): CookieIssue | null {
	if (!cookie.attrs.domain || !siteUrl) return null;

	try {
		const siteHost = new URL(siteUrl).hostname;
		const cookieDomain = cookie.attrs.domain.toLowerCase().replace(/^\./, '');

		// Check if domain matches
		const siteDomain = getRegistrableDomain(siteHost);
		const cookieDomainClean = getRegistrableDomain(cookieDomain);

		if (siteDomain !== cookieDomainClean && !siteHost.endsWith('.' + cookieDomain)) {
			return {
				type: 'warn',
				id: `cookie-${cookie.name}-domain-mismatch`,
				title: 'Domain mismatch',
				messageKey: 'cookieDebugger.issues.domainMismatch',
				relatedCookieName: cookie.name,
				relatedAttribute: 'Domain'
			};
		}
	} catch {
		// Invalid URL, skip
	}

	return null;
}

function getRegistrableDomain(hostname: string): string {
	// For MVP, just return hostname as-is for now
	// Can be enhanced with eTLD+1 logic later
	const parts = hostname.split('.');
	if (parts.length >= 2) {
		return parts.slice(-2).join('.');
	}
	return hostname;
}

