import { describe, it, expect } from 'vitest';
import { decodeJwt, extractJwtFromAuth, isJwtExpired, isJwtNotActive } from './jwt';

// Simple test JWT (header.payload.signature)
const testJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('jwt', () => {
	it('should decode JWT', () => {
		const decoded = decodeJwt(testJwt);
		expect(decoded).not.toBeNull();
		expect(decoded?.header.alg).toBe('HS256');
		expect(decoded?.payload.sub).toBe('1234567890');
	});

	it('should return null for invalid JWT', () => {
		expect(decodeJwt('invalid')).toBeNull();
		expect(decodeJwt('not.a.jwt')).toBeNull();
	});

	it('should extract JWT from Authorization header', () => {
		expect(extractJwtFromAuth('Bearer token123')).toBe('token123');
		expect(extractJwtFromAuth('bearer token123')).toBe('token123');
		expect(extractJwtFromAuth('Token token123')).toBeNull();
		expect(extractJwtFromAuth(null)).toBeNull();
	});

	it('should detect expired JWT', () => {
		const expiredJwt = createTestJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
		const decoded = decodeJwt(expiredJwt);
		expect(decoded).not.toBeNull();
		expect(isJwtExpired(decoded!)).toBe(true);
	});

	it('should detect not-yet-active JWT', () => {
		const futureJwt = createTestJwt({ nbf: Math.floor(Date.now() / 1000) + 3600 });
		const decoded = decodeJwt(futureJwt);
		expect(decoded).not.toBeNull();
		expect(isJwtNotActive(decoded!)).toBe(true);
	});

	it('should extract scopes and roles', () => {
		const jwtWithScopes = createTestJwt({ 
			scope: 'read write',
			roles: ['admin', 'user']
		});
		const decoded = decodeJwt(jwtWithScopes);
		expect(decoded?.scopes).toEqual(['read', 'write']);
		expect(decoded?.roles).toEqual(['admin', 'user']);
	});
});

function createTestJwt(payload: Record<string, unknown>): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
	const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
	return `${headerB64}.${payloadB64}.signature`;
}

