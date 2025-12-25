import { describe, it, expect } from 'vitest';
import { analyzeHeaderIssues, getHeaderHint, parseCacheControl, parseSetCookie } from './issues';
import type { ParsedHeader } from './types';

describe('issues', () => {
	describe('parseCacheControl', () => {
		it('should parse simple directives', () => {
			const result = parseCacheControl('public, max-age=3600');
			expect(result.public).toBe(true);
			expect(result['max-age']).toBe('3600');
		});
		
		it('should parse no-store directive', () => {
			const result = parseCacheControl('no-store');
			expect(result['no-store']).toBe(true);
		});
	});
	
	describe('parseSetCookie', () => {
		it('should parse cookie with attributes', () => {
			const result = parseSetCookie('session=abc123; HttpOnly; Secure; SameSite=Strict');
			expect(result.name).toBe('session');
			expect(result.value).toBe('abc123');
			expect(result.attrs.httponly).toBe(true);
			expect(result.attrs.secure).toBe(true);
			expect(result.attrs.samesite).toBe('Strict');
		});
		
		it('should parse SameSite=None', () => {
			const result = parseSetCookie('token=xyz; SameSite=None');
			expect(result.attrs.samesite).toBe('None');
		});
	});
	
	describe('analyzeHeaderIssues', () => {
		it('should detect CORS star with credentials error', () => {
			const headers: ParsedHeader[] = [
				{ name: 'Access-Control-Allow-Origin', normalizedName: 'access-control-allow-origin', value: '*', originalValue: '*', duplicateCount: 1 },
				{ name: 'Access-Control-Allow-Credentials', normalizedName: 'access-control-allow-credentials', value: 'true', originalValue: 'true', duplicateCount: 1 }
			];
			
			const issues = analyzeHeaderIssues(headers, 'response');
			const error = issues.find((i) => i.type === 'error' && i.id === 'cors-star-with-credentials');
			
			expect(error).toBeDefined();
			expect(error?.related).toHaveLength(2);
		});
		
		it('should detect SameSite=None without Secure error', () => {
			const headers: ParsedHeader[] = [
				{ name: 'Set-Cookie', normalizedName: 'set-cookie', value: 'session=abc; SameSite=None', originalValue: 'session=abc; SameSite=None', duplicateCount: 1 }
			];
			
			const issues = analyzeHeaderIssues(headers, 'response');
			const error = issues.find((i) => i.type === 'error' && i.id === 'cookie-samesite-none-no-secure');
			
			expect(error).toBeDefined();
		});
		
		it('should detect missing Vary: Origin recommendation', () => {
			const headers: ParsedHeader[] = [
				{ name: 'Access-Control-Allow-Origin', normalizedName: 'access-control-allow-origin', value: 'https://example.com', originalValue: 'https://example.com', duplicateCount: 1 },
				{ name: 'Access-Control-Allow-Credentials', normalizedName: 'access-control-allow-credentials', value: 'true', originalValue: 'true', duplicateCount: 1 }
			];
			
			const issues = analyzeHeaderIssues(headers, 'response');
			const info = issues.find((i) => i.id === 'cors-vary-origin');
			
			expect(info).toBeDefined();
			expect(info?.type).toBe('info');
		});
		
		it('should detect cache missing validation', () => {
			const headers: ParsedHeader[] = [
				{ name: 'Cache-Control', normalizedName: 'cache-control', value: 'public, max-age=3600', originalValue: 'public, max-age=3600', duplicateCount: 1 }
			];
			
			const issues = analyzeHeaderIssues(headers, 'response');
			const info = issues.find((i) => i.id === 'cache-missing-validation');
			
			expect(info).toBeDefined();
		});
		
		it('should detect weak ETag', () => {
			const headers: ParsedHeader[] = [
				{ name: 'ETag', normalizedName: 'etag', value: 'W/"abc123"', originalValue: 'W/"abc123"', duplicateCount: 1 }
			];
			
			const issues = analyzeHeaderIssues(headers, 'response');
			const warn = issues.find((i) => i.id === 'etag-weak');
			
			expect(warn).toBeDefined();
			expect(warn?.type).toBe('warn');
		});
	});
	
	describe('getHeaderHint', () => {
		it('should return hint for ACAO with star and credentials', () => {
			const selected: ParsedHeader = {
				name: 'Access-Control-Allow-Origin',
				normalizedName: 'access-control-allow-origin',
				value: '*',
				originalValue: '*',
				duplicateCount: 1
			};
			
			const all: ParsedHeader[] = [
				selected,
				{ name: 'Access-Control-Allow-Credentials', normalizedName: 'access-control-allow-credentials', value: 'true', originalValue: 'true', duplicateCount: 1 }
			];
			
			const hint = getHeaderHint(selected, all, 'response');
			expect(hint).toBeDefined();
			expect(hint?.tone).toBe('warn');
		});
		
		it('should return hint for Set-Cookie SameSite=None without Secure', () => {
			const selected: ParsedHeader = {
				name: 'Set-Cookie',
				normalizedName: 'set-cookie',
				value: 'session=abc; SameSite=None',
				originalValue: 'session=abc; SameSite=None',
				duplicateCount: 1
			};
			
			const hint = getHeaderHint(selected, [selected], 'response');
			expect(hint).toBeDefined();
			expect(hint?.tone).toBe('warn');
		});
		
		it('should return null for header without hint', () => {
			const selected: ParsedHeader = {
				name: 'Content-Type',
				normalizedName: 'content-type',
				value: 'text/plain',
				originalValue: 'text/plain',
				duplicateCount: 1
			};
			
			const hint = getHeaderHint(selected, [selected], 'response');
			expect(hint).toBeNull();
		});
	});
});

