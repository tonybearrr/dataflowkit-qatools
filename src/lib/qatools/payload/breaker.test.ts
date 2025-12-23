import { describe, it, expect } from 'vitest';
import { applyRules, generatePresetRules } from './breaker';

describe('breaker', () => {
	it('should remove field', () => {
		const base = { name: 'John', email: 'john@example.com' };
		const rules = [
			{
				id: '1',
				path: 'email',
				mode: 'remove' as const
			}
		];
		const result = applyRules(base, rules);
		expect(result.payload).toEqual({ name: 'John' });
		expect(result.warnings).toEqual([]);
	});

	it('should set null', () => {
		const base = { name: 'John', email: 'john@example.com' };
		const rules = [
			{
				id: '1',
				path: 'email',
				mode: 'setNull' as const
			}
		];
		const result = applyRules(base, rules);
		expect(result.payload).toEqual({ name: 'John', email: null });
	});

	it('should convert to wrong type', () => {
		const base = { name: 'John', age: 25 };
		const rules = [
			{
				id: '1',
				path: 'name',
				mode: 'wrongType' as const
			}
		];
		const result = applyRules(base, rules);
		expect(typeof result.payload.name).toBe('number');
	});

	it('should handle nested paths', () => {
		const base = { user: { email: 'john@example.com' } };
		const rules = [
			{
				id: '1',
				path: 'user.email',
				mode: 'remove' as const
			}
		];
		const result = applyRules(base, rules);
		expect(result.payload.user).toEqual({});
	});

	it('should generate preset rules for wrongTypes', () => {
		const base = {
			name: 'John',
			email: 'john@example.com',
			age: 25
		};
		const rules = generatePresetRules(base, 'wrongTypes');
		expect(rules.length).toBeGreaterThan(0);
		expect(rules.every((r) => r.mode === 'wrongType')).toBe(true);
	});
});
