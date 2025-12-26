import type { ParsedCookie, ParsedCookiesResult, CookieAttributes } from './types';

export function parseCookies(
	rawInput: string,
	mode: 'set-cookie' | 'cookie' = 'set-cookie'
): ParsedCookiesResult {
	const lines = rawInput.split('\n');
	const cookies: ParsedCookie[] = [];
	let lineNumber = 0;

	for (const line of lines) {
		lineNumber++;
		const trimmed = line.trim();
		
		if (!trimmed) continue;

		// For Set-Cookie mode, parse each line as a separate Set-Cookie header
		if (mode === 'set-cookie') {
			const colonIndex = trimmed.indexOf(':');
			const cookieValue = colonIndex >= 0 
				? trimmed.slice(colonIndex + 1).trim()
				: trimmed;

			if (cookieValue) {
				const parsed = parseSetCookie(cookieValue, lineNumber);
				if (parsed) {
					cookies.push(parsed);
				}
			}
		} else {
			// For Cookie mode, parse as "Cookie: name1=value1; name2=value2; ..."
			const colonIndex = trimmed.indexOf(':');
			const cookieValue = colonIndex >= 0 
				? trimmed.slice(colonIndex + 1).trim()
				: trimmed;

			if (cookieValue) {
				const parsedCookies = parseCookieHeader(cookieValue, lineNumber);
				cookies.push(...parsedCookies);
			}
		}
	}

	return {
		cookies,
		issues: [],
		mode
	};
}

function parseSetCookie(value: string, lineNumber: number): ParsedCookie | null {
	const parts = value.split(';').map((p) => p.trim());
	if (parts.length === 0) return null;

	const [nameValue, ...attrParts] = parts;
	const eqIndex = nameValue.indexOf('=');
	
	if (eqIndex === -1) return null;

	const name = nameValue.slice(0, eqIndex).trim();
	const cookieValue = nameValue.slice(eqIndex + 1).trim();

	if (!name) return null;

	const unquotedValue = cookieValue.startsWith('"') && cookieValue.endsWith('"')
		? cookieValue.slice(1, -1)
		: cookieValue;

	const attrs: CookieAttributes = {};
	let hostOnly = true;

	for (const attr of attrParts) {
		const lowerAttr = attr.toLowerCase();
		
		if (lowerAttr === 'secure') {
			attrs.secure = true;
		} else if (lowerAttr === 'httponly' || lowerAttr === 'http-only') {
			attrs.httpOnly = true;
		} else {
			const eqIndex = attr.indexOf('=');
			if (eqIndex === -1) continue;

			const key = attr.slice(0, eqIndex).trim().toLowerCase();
			const val = attr.slice(eqIndex + 1).trim();

			switch (key) {
				case 'domain':
					// Normalize domain
					const normalizedDomain = val.trim().toLowerCase().replace(/^\./, '');
					attrs.domain = normalizedDomain;
					hostOnly = false;
					break;
				case 'path':
					attrs.path = val;
					break;
				case 'samesite':
					const sameSiteVal = val.toLowerCase();
					if (sameSiteVal === 'strict' || sameSiteVal === 'lax' || sameSiteVal === 'none') {
						attrs.sameSite = sameSiteVal.charAt(0).toUpperCase() + sameSiteVal.slice(1) as 'Strict' | 'Lax' | 'None';
					}
					break;
				case 'max-age':
					const maxAge = parseInt(val, 10);
					if (!isNaN(maxAge)) {
						attrs.maxAge = maxAge;
					}
					break;
				case 'expires':
					const expiresDate = new Date(val);
					if (!isNaN(expiresDate.getTime())) {
						attrs.expires = expiresDate;
					} else {
						attrs.expires = val;
					}
					break;
			}
		}
	}

	return {
		name,
		value: unquotedValue,
		attrs,
		hostOnly,
		rawLine: value,
		lineNumber
	};
}

function parseCookieHeader(value: string, lineNumber: number): ParsedCookie[] {
	const cookies: ParsedCookie[] = [];
	const parts = value.split(';').map((p) => p.trim());

	for (const part of parts) {
		const eqIndex = part.indexOf('=');
		if (eqIndex === -1) continue;

		const name = part.slice(0, eqIndex).trim();
		const cookieValue = part.slice(eqIndex + 1).trim();

		if (!name) continue;

		cookies.push({
			name,
			value: cookieValue,
			attrs: {},
			hostOnly: true,
			rawLine: part,
			lineNumber
		});
	}

	return cookies;
}

