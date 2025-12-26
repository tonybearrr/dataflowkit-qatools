export type Locale = 'en' | 'uk' | 'ru';

export interface Translations {
	common: {
		qaToolbox: string;
		madeBy: string;
		donate: string;
		privacy: string;
		about: string;
		privacyFirst: string;
		noTracking: string;
		localOnly: string;
		builtBy: string;
		moreToolsComing: string;
		copy: string;
		clear: string;
		parse: string;
	};
	nav: {
		testDataGenerator: string;
		apiResponseValidator: string;
		statusCodeReference: string;
		headersInspector: string;
		cookieDebugger: string;
		authDebugger: string;
	};
	home: {
		title: string;
		description: string;
		testDataGenerator: {
			title: string;
			description: string;
			tags: string[];
		};
		apiResponseValidator: {
			title: string;
			description: string;
			tags: string[];
		};
		statusCodeReference: {
			title: string;
			description: string;
			tags: string[];
		};
		headersInspector: {
			title: string;
			description: string;
			tags: string[];
		};
		cookieDebugger: {
			title: string;
			description: string;
			tags: string[];
		};
		authDebugger: {
			title: string;
			description: string;
			tags: string[];
		};
		payloadBuilder: {
			title: string;
			description: string;
			tags: string[];
		};
	};
	testDataGenerator: {
		title: string;
		description: string;
		heading: string;
		subtitle: string;
		whatIsTestData: string;
		testDataDescription: string;
		parameters: string;
		presets: string;
		presetsDescription: string;
		presetsList: string;
		fields: string;
		fieldName: string;
		fieldType: string;
		fieldRequired: string;
		fieldManage: string;
		preview: string;
		previewDescription: string;
		previewRegenerate: string;
		export: string;
		exportRows: string;
		exportSeed: string;
		exportFormat: string;
		exportArrayKey: string;
		exportActions: string;
		features: string;
		featureSchema: string;
		featureSeed: string;
		featureExport: string;
		featureLocal: string;
		useCases: string;
		useCase1: string;
		useCase2: string;
		useCase3: string;
		useCase4: string;
		privacy: string;
		privacyText: string;
		confirmReplaceTitle: string;
		confirmReplaceMessage: string;
		confirmCancel: string;
		confirmContinue: string;
	};
	payloadBuilder: {
		title: string;
		description: string;
		heading: string;
		subtitle: string;
	};
	apiResponseValidator: {
		title: string;
		description: string;
		heading: string;
		subtitle: string;
		payloadLabel: string;
		schemaLabel: string;
		validate: string;
		autoValidate: string;
		formatPayload: string;
		formatSchema: string;
		selectPreset: string;
		reset: string;
		valid: string;
		invalid: string;
		parseError: string;
		schemaParseError: string;
		line: string;
		column: string;
		error: string;
		errors: string;
		keyword: string;
		expected: string;
		received: string;
		copy: string;
		copied: string;
		copyError: string;
		noValidation: string;
		formattedOutput: string;
		whatIs: string;
		parameters: string;
		payloadDesc: string;
		schemaDesc: string;
		autoValidateDesc: string;
		presets: string;
		presetsDesc: string;
		format: string;
		formatDesc: string;
		privacy: string;
		privacyText: string;
	};
	statusCodeReference: {
		title: string;
		description: string;
	};
	headersInspector: {
		title: string;
		description: string;
	};
	cookieDebugger: {
		title: string;
		description: string;
	};
	authDebugger: {
		title: string;
		description: string;
		heading: string;
		subtitle: string;
	};
	privacy: {
		title: string;
		description: string;
	};
}
