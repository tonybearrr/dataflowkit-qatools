import { describe, it, expect } from 'vitest';
import { generateRow, validateSchema, generateDataset } from './generate';
import { createRng } from './rng';
import type { FieldSchema } from './types';
import { FieldType } from './types';

describe('Test Data Generator', () => {
	describe('createRng', () => {
		it('should generate deterministic values with same seed', () => {
			const rng1 = createRng('test-seed');
			const rng2 = createRng('test-seed');
			
			const values1 = Array.from({ length: 10 }, () => rng1());
			const values2 = Array.from({ length: 10 }, () => rng2());
			
			expect(values1).toEqual(values2);
		});

		it('should generate different values with different seeds', () => {
			const rng1 = createRng('seed1');
			const rng2 = createRng('seed2');
			
			const values1 = Array.from({ length: 10 }, () => rng1());
			const values2 = Array.from({ length: 10 }, () => rng2());
			
			expect(values1).not.toEqual(values2);
		});
	});

	describe('generateRow', () => {
		it('should generate row with correct types', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'id', type: FieldType.Uuid, required: true, nullable: false, nullChance: 0 },
				{ id: '2', name: 'email', type: FieldType.Email, required: true, nullable: false, nullChance: 0 },
				{ id: '3', name: 'age', type: FieldType.Number, required: true, nullable: false, nullChance: 0, options: { min: 18, max: 65, integerOnly: true } },
				{ id: '4', name: 'active', type: FieldType.Boolean, required: true, nullable: false, nullChance: 0 }
			];

			const rng = createRng('test');
			const row = generateRow(schema, rng);

			expect(row.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
			expect(row.email).toContain('@');
			expect(typeof row.age).toBe('number');
			expect(row.age).toBeGreaterThanOrEqual(18);
			expect(row.age).toBeLessThanOrEqual(65);
			expect(Number.isInteger(row.age)).toBe(true);
			expect(typeof row.active).toBe('boolean');
		});

		it('should respect nullable and nullChance', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'optional', type: FieldType.String, required: false, nullable: true, nullChance: 1.0 }
			];

			const rng = createRng('test');
			const row = generateRow(schema, rng);

			// With nullChance 1.0, should always be null
			expect(row.optional).toBeNull();
		});

		it('should generate enum values from provided list', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'status', type: FieldType.Enum, required: true, nullable: false, nullChance: 0, options: { values: ['active', 'inactive', 'pending'] } }
			];

			const rng = createRng('test');
			const row = generateRow(schema, rng);

			expect(['active', 'inactive', 'pending']).toContain(row.status);
		});
	});

	describe('validateSchema', () => {
		it('should validate empty schema', () => {
			const result = validateSchema([]);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should detect duplicate field names', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'field1', type: FieldType.String, required: true, nullable: false, nullChance: 0 },
				{ id: '2', name: 'field1', type: FieldType.String, required: true, nullable: false, nullChance: 0 }
			];

			const result = validateSchema(schema);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
		});

		it('should detect invalid nullChance', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'field1', type: FieldType.String, required: true, nullable: false, nullChance: 1.5 }
			];

			const result = validateSchema(schema);
			expect(result.valid).toBe(false);
		});

		it('should detect empty enum values', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'status', type: FieldType.Enum, required: true, nullable: false, nullChance: 0, options: { values: [] } }
			];

			const result = validateSchema(schema);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('Enum'))).toBe(true);
		});

		it('should detect min > max for numbers', () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'age', type: FieldType.Number, required: true, nullable: false, nullChance: 0, options: { min: 100, max: 50 } }
			];

			const result = validateSchema(schema);
			expect(result.valid).toBe(false);
		});
	});

	describe('generateDataset', () => {
		it('should generate correct number of rows', async () => {
			const schema: FieldSchema[] = [
				{ id: '1', name: 'id', type: FieldType.Uuid, required: true, nullable: false, nullChance: 0 }
			];

			const result = await generateDataset(schema, { rows: 10, seed: 'test', output: 'json' });
			expect(result.rows.length).toBe(10);
		});

		it('should return validation errors for invalid schema', async () => {
			const schema: FieldSchema[] = [];

			const result = await generateDataset(schema, { rows: 10, seed: 'test', output: 'json' });
			expect(result.rows.length).toBe(0);
			expect(result.warnings.length).toBeGreaterThan(0);
		});
	});
});
