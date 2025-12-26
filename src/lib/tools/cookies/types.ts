export interface CookieAttributes {
	domain?: string;
	path?: string;
	expires?: Date | string;
	maxAge?: number;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface ParsedCookie {
	name: string;
	value: string;
	attrs: CookieAttributes;
	hostOnly: boolean; // true if Domain not set
	rawLine: string;
	lineNumber?: number;
}

export interface CookieContext {
	siteUrl: string; 
	requestUrl: string;
	isHttps: boolean; 
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
	isTopLevelNavigation: boolean; // true for navigation, false for fetch/XHR
	isIframe: boolean; // true if request is in iframe
	isCrossSite: boolean; // true if siteUrl and requestUrl are different sites
}

export interface CookieSendResult {
	ok: boolean; // true if cookie will be sent
	reasons: string[];
	warnings: string[];
}

export interface CookieIssue {
	type: 'error' | 'warn' | 'info';
	id: string;
	title: string;
	message?: string;
	messageKey?: string;
	relatedCookieName?: string;
	relatedAttribute?: string;
}

export interface ParsedCookiesResult {
	cookies: ParsedCookie[];
	issues: CookieIssue[];
	mode: 'set-cookie' | 'cookie'; // Set-Cookie (response) or Cookie (request)
}

