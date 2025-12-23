import { describe, it, expect } from 'vitest';
import { toCSV, toJSON } from './export';

describe('Export Functions', () => {
	describe('toCSV', () => {
		it('should generate CSV with headers', () => {
			const rows = [
				{ id: 1, name: 'John', email: 'john@example.com' },
				{ id: 2, name: 'Jane', email: 'jane@example.com' }
			];

			const csv = toCSV(rows, true);
			expect(csv).toContain('id,name,email');
			expect(csv).toContain('1,John,john@example.com');
			expect(csv).toContain('2,Jane,jane@example.com');
		});

		it('should escape commas in values', () => {
			const rows = [{ name: 'John, Doe', value: 'test' }];
			const csv = toCSV(rows, true);
			expect(csv).toContain('"John, Doe"');
		});

		it('should escape quotes in values', () => {
			const rows = [{ name: 'John "Johnny" Doe', value: 'test' }];
			const csv = toCSV(rows, true);
			expect(csv).toContain('"John ""Johnny"" Doe"');
		});

		it('should handle null and undefined', () => {
			const rows = [{ name: 'John', value: null, other: undefined }];
			const csv = toCSV(rows, true);
			expect(csv).toContain('name,value,other');
			expect(csv).toContain('John,,');
		});

		it('should generate CSV without headers', () => {
			const rows = [{ id: 1, name: 'John' }];
			const csv = toCSV(rows, false);
			expect(csv).not.toContain('id,name');
			expect(csv).toContain('1,John');
		});
	});

	describe('toJSON', () => {
		it('should generate JSON array', () => {
			const rows = [{ id: 1, name: 'John' }];
			const json = toJSON(rows);
			const parsed = JSON.parse(json);
			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed[0]).toEqual({ id: 1, name: 'John' });
		});

		it('should wrap in object with arrayKey', () => {
			const rows = [{ id: 1, name: 'John' }];
			const json = toJSON(rows, 'items');
			const parsed = JSON.parse(json);
			expect(parsed).toHaveProperty('items');
			expect(parsed.items).toEqual([{ id: 1, name: 'John' }]);
		});
	});
});
