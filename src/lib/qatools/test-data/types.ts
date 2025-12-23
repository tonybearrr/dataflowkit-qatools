export enum FieldType {
	String = 'string',
	Number = 'number',
	Boolean = 'boolean',
	Date = 'date',
	Enum = 'enum',
	Uuid = 'uuid',
	Email = 'email',
	Phone = 'phone',
	Name = 'name',
	Address = 'address',
	CustomRegex = 'customRegex'
}

export interface StringOptions {
	minLen?: number;
	maxLen?: number;
	pattern?: string; // regex string
}

export interface NumberOptions {
	min?: number;
	max?: number;
	integerOnly?: boolean;
	step?: number;
}

export interface DateOptions {
	from?: string; // ISO date string
	to?: string; // ISO date string
	format?: 'iso' | 'unix' | 'ms';
}

export interface EnumOptions {
	values: string[];
}

export interface EmailOptions {
	domains?: string[];
}

export interface PhoneOptions {
	country?: string; // default "UA"
	format?: 'e164' | 'local';
}

export interface NameOptions {
	style?: 'full' | 'first' | 'last';
}

export interface AddressOptions {
	parts?: {
		city?: boolean;
		street?: boolean;
		zip?: boolean;
		country?: boolean;
	};
}

export interface CustomRegexOptions {
	pattern: string;
}

export type FieldOptions =
	| StringOptions
	| NumberOptions
	| DateOptions
	| EnumOptions
	| EmailOptions
	| PhoneOptions
	| NameOptions
	| AddressOptions
	| CustomRegexOptions;

export interface FieldSchema {
	id: string;
	name: string; // key in output
	type: FieldType;
	required: boolean;
	nullable: boolean; // if true: can output null based on probability
	nullChance: number; // 0..1, default 0.0
	options?: FieldOptions;
}

export interface GeneratorConfig {
	rows: number;
	seed: string; // empty string = random
	locale?: 'en' | 'uk';
	output: 'json' | 'csv';
	includeHeaderRow?: boolean; // csv only
	arrayKey?: string; // optional: wrap in {items: []}
}

export interface GeneratorResult {
	rows: Record<string, any>[];
	warnings: string[];
}
