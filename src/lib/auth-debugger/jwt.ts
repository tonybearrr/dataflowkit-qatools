import type { ParsedJwt } from './types';


 //Decode JWT without verification (client-side only)
export function decodeJwt(token: string): ParsedJwt | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const header = JSON.parse(base64UrlDecode(parts[0]));
		const payload = JSON.parse(base64UrlDecode(parts[1]));

		const parsed: ParsedJwt = {
			header,
			payload,
			raw: token
		};

		// Extract common claims
		if (payload.exp) parsed.exp = payload.exp;
		if (payload.nbf) parsed.nbf = payload.nbf;
		if (payload.iss) parsed.iss = payload.iss;
		if (payload.aud) parsed.aud = payload.aud;
		if (payload.sub) parsed.sub = payload.sub;

		// Extract scopes/roles (common patterns)
		if (payload.scope) {
			parsed.scopes = typeof payload.scope === 'string' 
				? payload.scope.split(' ') 
				: Array.isArray(payload.scope) 
					? payload.scope 
					: [];
		}
		if (payload.scopes) {
			parsed.scopes = Array.isArray(payload.scopes) ? payload.scopes : [];
		}
		if (payload.roles) {
			parsed.roles = Array.isArray(payload.roles) ? payload.roles : [];
		}
		if (payload.role) {
			parsed.roles = typeof payload.role === 'string' 
				? [payload.role] 
				: Array.isArray(payload.role) 
					? payload.role 
					: [];
		}

		return parsed;
	} catch (e) {
		return null;
	}
}


 // Supports both "Bearer <token>" format and plain token
export function extractJwtFromAuth(authHeader: string | null): string | null {
	if (!authHeader) return null;
	
	// Try Bearer format first
	const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
	if (bearerMatch) return bearerMatch[1];
	
	// If no Bearer prefix, check if it looks like a JWT (three parts separated by dots)
	const trimmed = authHeader.trim();
	if (trimmed.split('.').length === 3) {
		return trimmed;
	}
	
	return null;
}

export function isJwtExpired(jwt: ParsedJwt): boolean {
	if (!jwt.exp) return false;
	return jwt.exp < Math.floor(Date.now() / 1000);
}

export function isJwtNotActive(jwt: ParsedJwt): boolean {
	if (!jwt.nbf) return false;
	return jwt.nbf > Math.floor(Date.now() / 1000);
}

function base64UrlDecode(str: string): string {
	// Add padding if needed
	let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) {
		base64 += '=';
	}
	
	try {
		return decodeURIComponent(
			atob(base64)
				.split('')
				.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
	} catch {
		return '';
	}
}

