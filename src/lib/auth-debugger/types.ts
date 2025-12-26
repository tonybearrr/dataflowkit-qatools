export interface ParsedHeaders {
	[key: string]: string | string[];
}

export interface ParsedCookies {
	setCookie: string[];
	cookieHeader: string | null;
}

export interface ParsedJwt {
	header: Record<string, unknown>;
	payload: Record<string, unknown>;
	raw: string;
	exp?: number;
	nbf?: number;
	iss?: string;
	aud?: string | string[];
	sub?: string;
	scopes?: string[];
	roles?: string[];
}

export interface AuthContext {
	requestUrl?: string;
	siteUrl?: string;
	method?: string;
	inIframe?: boolean;
	topLevelNav?: boolean;
}

export interface ParsedAuthData {
	statusCode: number | null;
	statusText?: string;
	requestHeaders: ParsedHeaders;
	responseHeaders: ParsedHeaders;
	cookies: ParsedCookies;
	authorization: string | null;
	jwt: ParsedJwt | null;
	context: AuthContext;
	method?: string;
	requestUrl?: string;
}

export type IssueLevel = 'error' | 'warning' | 'info';
export type Severity = 'error' | 'warning' | 'info';
export type Confidence = 'high' | 'medium' | 'low';

export interface RelatedItem {
	kind: 'header' | 'cookie' | 'jwt' | 'context';
	key?: string;
}

export type IssueSource = 'request' | 'response' | 'combined';

export interface AuthIssue {
	id: string;
	level: IssueLevel;
	title: string;
	explanation: string;
	related: RelatedItem[];
	fix: string[];
	backendTip?: string;
	source: IssueSource;
}

export interface AuthAnalysis {
	summary: string;
	severity: Severity;
	issues: AuthIssue[];
	recommendations: string[];
	confidence: Confidence;
}

