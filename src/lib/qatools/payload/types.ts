export type NodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export type Constraints = {
	min?: number;
	max?: number;
	minLen?: number;
	maxLen?: number;
	pattern?: string;
	enum?: string[];
};

export interface JsonNode {
	id: string;
	key?: string;
	type: NodeType;
	value?: string | number | boolean | null;
	children?: JsonNode[];
	meta?: {
		required?: boolean;
		description?: string;
		constraints?: Constraints;
	};
}

export type BreakerMode =
	| 'remove'
	| 'setNull'
	| 'wrongType'
	| 'emptyString'
	| 'tooLong'
	| 'outOfRange'
	| 'invalidEnum';

export interface BreakerRule {
	id: string;
	path: string; // JSONPath-like: `user.email`, `items[0].price`
	mode: BreakerMode;
	params?: {
		// for wrongType: target type
		targetType?: NodeType;
		// for tooLong: length
		length?: number;
		// for outOfRange: value
		value?: number;
		// for invalidEnum: value
		enumValue?: string;
	};
}

export interface PayloadVariant {
	id: string;
	name: string;
	baseId: string;
	rules: BreakerRule[];
	payload?: any;
	warnings?: string[];
}

export interface PayloadTemplate {
	id: string;
	name: string;
	description: string;
	payload: any;
	metadata?: Record<string, { required?: boolean; constraints?: Constraints }>;
}

export interface ToolState {
	basePayload: {
		tree: JsonNode | null;
		raw: string;
	};
	selectedTemplate?: string;
	variants: PayloadVariant[];
	selectedVariantId?: string;
	uiPreferences?: {
		lastTab?: string;
	};
}
