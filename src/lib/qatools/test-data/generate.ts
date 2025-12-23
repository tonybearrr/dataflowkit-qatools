import type { FieldSchema, GeneratorResult, GeneratorConfig } from './types';
import { FieldType } from './types';
import { createRng } from './rng';

const FIRST_NAMES_EN = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'George', 'Harry', 'Jack', 'Liam', 'Mason', 'Noah', 'Oliver', 'William'];
const LAST_NAMES_EN = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];
const FIRST_NAMES_UK = ['Олександр', 'Іван', 'Марія', 'Дмитро', 'Олена', 'Андрій', 'Наталія', 'Сергій', 'Тетяна', 'Василь', 'Антон'];
const LAST_NAMES_UK = ['Шевченко', 'Іваненко', 'Мельник', 'Коваленко', 'Бондаренко', 'Бойко', 'Ткаченко', 'Мороз', 'Кравченко', 'Сидоренко', 'Пономарьов'];
const CITIES = ['Kyiv', 'Lviv', 'Kharkiv', 'Odesa', 'Dnipro', 'London', 'New York', 'Berlin', 'Paris', 'Madrid', 'Rome', 'Moscow', 'Saint Petersburg', 'Beijing', 'Tokyo', 'Sydney', 'Mumbai', 'Delhi', 'Bangkok', 'Jakarta', 'Seoul', 'Taipei', 'Osaka', 'Sapporo', 'Nagoya', 'Fukuoka', 'Shenzhen', 'Hangzhou', 'Wuhan', 'Chongqing', 'Shanghai', 'Beijing', 'Tokyo', 'Sydney', 'Mumbai', 'Delhi', 'Bangkok', 'Jakarta', 'Seoul', 'Taipei', 'Osaka', 'Sapporo', 'Nagoya', 'Fukuoka'];
const STREETS = ['Main St', 'Oak Ave', 'Broadway', 'Wall Street', 'Market Street',, 'Park Avenue', 'First Street', 'Second Street', 'Third Street', 'Fourth Street', 'Fifth Street', 'Sixth Street', 'Seventh Street', 'Eighth Street', 'Ninth Street', 'Tenth Street'];
const DOMAINS = ['example.com', 'test.com', 'sample.org', 'demo.net', 'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'comcast.net', 'verizon.net', 'att.net'];

function randomString(length: number, rng: () => number): string {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[Math.floor(rng() * chars.length)];
	}
	return result;
}

function randomWords(count: number, rng: () => number): string {
	const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
	const result: string[] = [];
	for (let i = 0; i < count; i++) {
		result.push(words[Math.floor(rng() * words.length)]);
	}
	return result.join(' ');
}

function generateUuid(rng: () => number): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (rng() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function generateEmail(options: any, rng: () => number, locale?: string): string {
	const domains = options?.domains && options.domains.length > 0 
		? options.domains 
		: DOMAINS;
	const username = randomString(8, rng);
	const domain = domains[Math.floor(rng() * domains.length)];
	return `${username}@${domain}`;
}

function generatePhone(options: any, rng: () => number): string {
	const country = options?.country || 'UA';
	const format = options?.format || 'local';
	
	if (format === 'e164') {
		return `+380${Math.floor(100000000 + rng() * 900000000)}`;
	}
	return `0${Math.floor(100000000 + rng() * 900000000)}`;
}

function generateName(options: any, rng: () => number, locale?: string): string {
	const style = options?.style || 'full';
	const isUk = locale === 'uk';
	const firstNames = isUk ? FIRST_NAMES_UK : FIRST_NAMES_EN;
	const lastNames = isUk ? LAST_NAMES_UK : LAST_NAMES_EN;
	
	if (style === 'first') {
		return firstNames[Math.floor(rng() * firstNames.length)];
	}
	if (style === 'last') {
		return lastNames[Math.floor(rng() * lastNames.length)];
	}
	return `${firstNames[Math.floor(rng() * firstNames.length)]} ${lastNames[Math.floor(rng() * lastNames.length)]}`;
}

function generateAddress(options: any, rng: () => number): string {
	const parts = options?.parts || {};
	const components: string[] = [];
	
	if (parts.street !== false) {
		const streetNumber = Math.floor(rng() * 9999) + 1;
		const street = STREETS[Math.floor(rng() * STREETS.length)];
		components.push(`${streetNumber} ${street}`);
	}
	
	if (parts.city !== false) {
		components.push(CITIES[Math.floor(rng() * CITIES.length)]);
	}
	
	if (parts.zip) {
		components.push(`${Math.floor(10000 + rng() * 90000)}`);
	}
	
	if (parts.country) {
		components.push('Ukraine');
	}
	
	return components.join(', ') || '123 Main St, Kyiv';
}

function generateValue(field: FieldSchema, rng: () => number, locale?: string): any {
	// Check nullable
	if (field.nullable && rng() < field.nullChance) {
		return null;
	}

	const options = field.options || {};

	switch (field.type) {
		case FieldType.String: {
			const opts = options as any;
			const minLen = opts?.minLen || 5;
			const maxLen = opts?.maxLen || 20;
			const len = Math.floor(minLen + rng() * (maxLen - minLen + 1));
			if (opts?.pattern) {
				// Simple regex support - for complex patterns, just generate random string
				return randomString(len, rng);
			}
			return randomWords(Math.ceil(len / 5), rng).substring(0, len);
		}

		case FieldType.Number: {
			const opts = options as any;
			const min = opts?.min ?? 0;
			const max = opts?.max ?? 1000;
			let value = min + rng() * (max - min);
			if (opts?.integerOnly) {
				value = Math.floor(value);
			} else if (opts?.step) {
				value = Math.floor(value / opts.step) * opts.step;
			}
			return value;
		}

		case FieldType.Boolean:
			return rng() > 0.5;

		case FieldType.Date: {
			const opts = options as any;
			const from = opts?.from ? new Date(opts.from).getTime() : Date.now() - 365 * 24 * 60 * 60 * 1000;
			const to = opts?.to ? new Date(opts.to).getTime() : Date.now();
			const timestamp = from + rng() * (to - from);
			const format = opts?.format || 'iso';
			
			if (format === 'unix') {
				return Math.floor(timestamp / 1000);
			}
			if (format === 'ms') {
				return timestamp;
			}
			return new Date(timestamp).toISOString();
		}

		case FieldType.Enum: {
			const opts = options as any;
			const values = opts?.values || [];
			if (values.length === 0) return '';
			return values[Math.floor(rng() * values.length)];
		}

		case FieldType.Uuid:
			return generateUuid(rng);

		case FieldType.Email:
			return generateEmail(options, rng, locale);

		case FieldType.Phone:
			return generatePhone(options, rng);

		case FieldType.Name:
			return generateName(options, rng, locale);

		case FieldType.Address:
			return generateAddress(options, rng);

		case FieldType.CustomRegex: {
			const opts = options as any;
			// For complex regex, fallback to simple string generation
			return randomString(10, rng);
		}

		default:
			return null;
	}
}

export function generateRow(
	schema: FieldSchema[],
	rng: () => number,
	locale?: string
): Record<string, any> {
	const row: Record<string, any> = {};

	for (const field of schema) {
		if (field.required || rng() > 0.1) {
			row[field.name] = generateValue(field, rng, locale);
		}
	}

	return row;
}

export function validateSchema(schema: FieldSchema[]): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	const names = new Set<string>();

	if (schema.length === 0) {
		errors.push('Schema must have at least one field');
		return { valid: false, errors };
	}

	for (let i = 0; i < schema.length; i++) {
		const field = schema[i];

		if (!field.name || field.name.trim() === '') {
			errors.push(`Field ${i + 1}: Name is required`);
		}

		if (names.has(field.name)) {
			errors.push(`Field "${field.name}": Duplicate field name`);
		}
		names.add(field.name);

		if (field.nullChance < 0 || field.nullChance > 1) {
			errors.push(`Field "${field.name}": nullChance must be between 0 and 1`);
		}

		if (field.type === FieldType.Enum) {
			const opts = field.options as any;
			if (!opts?.values || opts.values.length === 0) {
				errors.push(`Field "${field.name}": Enum must have at least one value`);
			}
		}

		if (field.type === FieldType.Number) {
			const opts = field.options as any;
			if (opts?.min !== undefined && opts?.max !== undefined && opts.min > opts.max) {
				errors.push(`Field "${field.name}": min must be <= max`);
			}
		}

		if (field.type === FieldType.String) {
			const opts = field.options as any;
			if (opts?.minLen !== undefined && opts?.maxLen !== undefined && opts.minLen > opts.maxLen) {
				errors.push(`Field "${field.name}": minLen must be <= maxLen`);
			}
		}

		if (field.type === FieldType.Date) {
			const opts = field.options as any;
			if (opts?.from && opts?.to) {
				const from = new Date(opts.from);
				const to = new Date(opts.to);
				if (isNaN(from.getTime()) || isNaN(to.getTime())) {
					errors.push(`Field "${field.name}": Invalid date format`);
				} else if (from > to) {
					errors.push(`Field "${field.name}": from date must be <= to date`);
				}
			}
		}
	}

	return { valid: errors.length === 0, errors };
}

export async function generateDataset(
	schema: FieldSchema[],
	config: GeneratorConfig,
	onProgress?: (progress: number) => void
): Promise<GeneratorResult> {
	const validation = validateSchema(schema);
	if (!validation.valid) {
		return { rows: [], warnings: validation.errors };
	}

	const rng = createRng(config.seed);
	const rows: Record<string, any>[] = [];
	const warnings: string[] = [];
	const totalRows = config.rows;
	const previewRows = Math.min(50, totalRows);

	// Generate preview first (synchronous for immediate feedback)
	for (let i = 0; i < previewRows; i++) {
		rows.push(generateRow(schema, rng, config.locale));
	}

	if (onProgress) {
		onProgress(previewRows / totalRows);
	}

	// Generate remaining rows in batches for large datasets
	if (totalRows > previewRows) {
		const batchSize = 1000;
		let generated = previewRows;

		const generateBatch = (): Promise<void> => {
			return new Promise((resolve) => {
				setTimeout(() => {
					const batchEnd = Math.min(generated + batchSize, totalRows);
					for (let i = generated; i < batchEnd; i++) {
						rows.push(generateRow(schema, rng, config.locale));
					}
					generated = batchEnd;

					if (onProgress) {
						onProgress(generated / totalRows);
					}

					if (generated < totalRows) {
						resolve(generateBatch());
					} else {
						resolve();
					}
				}, 0);
			});
		};

		await generateBatch();
	}

	return { rows, warnings };
}
