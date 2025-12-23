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
		userAgentParser: string;
		cookieInspector: string;
		headerInspector: string;
		testCaseBuilder: string;
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
		userAgentParser: {
			title: string;
			description: string;
			tags: string[];
		};
		cookieInspector: {
			title: string;
			description: string;
			tags: string[];
		};
		headerInspector: {
			title: string;
			description: string;
			tags: string[];
		};
		testCaseBuilder: {
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
	};
	statusCodeReference: {
		title: string;
		description: string;
	};
	userAgentParser: {
		title: string;
		description: string;
	};
	cookieInspector: {
		title: string;
		description: string;
	};
	headerInspector: {
		title: string;
		description: string;
	};
	testCaseBuilder: {
		title: string;
		description: string;
	};
	privacy: {
		title: string;
		description: string;
	};
}
