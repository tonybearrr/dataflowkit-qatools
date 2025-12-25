import type { HeaderInfo } from './types';

export const headerKnowledgeBase: HeaderInfo[] = [
	// Authentication
	{
		name: 'Authorization',
		normalizedName: 'authorization',
		shortDescription: 'Contains credentials for authentication',
		descriptionKey: 'headersInspector.headers.authorization.description',
		category: 'authentication',
		whenToUseKeys: [
			'headersInspector.headers.authorization.whenToUse1',
			'headersInspector.headers.authorization.whenToUse2'
		],
		commonMistakesKeys: [
			'headersInspector.headers.authorization.mistakes1',
			'headersInspector.headers.authorization.mistakes2'
		],
		securityNotesKey: 'headersInspector.headers.authorization.security'
	},
	{
		name: 'WWW-Authenticate',
		normalizedName: 'www-authenticate',
		shortDescription: 'Indicates authentication scheme required',
		descriptionKey: 'headersInspector.headers.wwwAuthenticate.description',
		category: 'authentication',
		whenToUseKeys: ['headersInspector.headers.wwwAuthenticate.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.wwwAuthenticate.mistakes1']
	},
	// Content
	{
		name: 'Content-Type',
		normalizedName: 'content-type',
		shortDescription: 'Indicates the media type of the resource',
		descriptionKey: 'headersInspector.headers.contentType.description',
		category: 'content',
		whenToUseKeys: [
			'headersInspector.headers.contentType.whenToUse1',
			'headersInspector.headers.contentType.whenToUse2'
		],
		commonMistakesKeys: [
			'headersInspector.headers.contentType.mistakes1',
			'headersInspector.headers.contentType.mistakes2'
		]
	},
	{
		name: 'Accept',
		normalizedName: 'accept',
		shortDescription: 'Specifies media types acceptable for the response',
		descriptionKey: 'headersInspector.headers.accept.description',
		category: 'content',
		whenToUseKeys: ['headersInspector.headers.accept.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.accept.mistakes1']
	},
	{
		name: 'Accept-Encoding',
		normalizedName: 'accept-encoding',
		shortDescription: 'Specifies compression methods supported by the client',
		descriptionKey: 'headersInspector.headers.acceptEncoding.description',
		category: 'content',
		whenToUseKeys: ['headersInspector.headers.acceptEncoding.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.acceptEncoding.mistakes1',
			'headersInspector.headers.acceptEncoding.mistakes2'
		],
		securityNotesKey: 'headersInspector.headers.acceptEncoding.security'
	},
	{
		name: 'Accept-Language',
		normalizedName: 'accept-language',
		shortDescription: 'Specifies preferred languages of the client',
		descriptionKey: 'headersInspector.headers.acceptLanguage.description',
		category: 'content',
		whenToUseKeys: ['headersInspector.headers.acceptLanguage.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.acceptLanguage.mistakes1',
			'headersInspector.headers.acceptLanguage.mistakes2'
		],
		securityNotesKey: 'headersInspector.headers.acceptLanguage.security'
	},
	{
		name: 'Content-Encoding',
		normalizedName: 'content-encoding',
		shortDescription: 'Indicates encoding transformations applied',
		descriptionKey: 'headersInspector.headers.contentEncoding.description',
		category: 'content',
		whenToUseKeys: ['headersInspector.headers.contentEncoding.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.contentEncoding.mistakes1']
	},
	{
		name: 'Content-Length',
		normalizedName: 'content-length',
		shortDescription: 'Size of the message body in bytes',
		descriptionKey: 'headersInspector.headers.contentLength.description',
		category: 'content',
		whenToUseKeys: ['headersInspector.headers.contentLength.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.contentLength.mistakes1']
	},
	// Caching
	{
		name: 'Cache-Control',
		normalizedName: 'cache-control',
		shortDescription: 'Directives for caching mechanisms',
		descriptionKey: 'headersInspector.headers.cacheControl.description',
		category: 'caching',
		whenToUseKeys: [
			'headersInspector.headers.cacheControl.whenToUse1',
			'headersInspector.headers.cacheControl.whenToUse2'
		],
		commonMistakesKeys: [
			'headersInspector.headers.cacheControl.mistakes1',
			'headersInspector.headers.cacheControl.mistakes2'
		]
	},
	{
		name: 'ETag',
		normalizedName: 'etag',
		shortDescription: 'Entity tag for cache validation',
		descriptionKey: 'headersInspector.headers.etag.description',
		category: 'caching',
		whenToUseKeys: ['headersInspector.headers.etag.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.etag.mistakes1']
	},
	{
		name: 'Last-Modified',
		normalizedName: 'last-modified',
		shortDescription: 'Date and time when the resource was last modified',
		descriptionKey: 'headersInspector.headers.lastModified.description',
		category: 'caching',
		whenToUseKeys: ['headersInspector.headers.lastModified.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.lastModified.mistakes1',
			'headersInspector.headers.lastModified.mistakes2'
		],
		securityNotesKey: 'headersInspector.headers.lastModified.security'
	},
	{
		name: 'If-None-Match',
		normalizedName: 'if-none-match',
		shortDescription: 'Conditional request using ETag',
		descriptionKey: 'headersInspector.headers.ifNoneMatch.description',
		category: 'caching',
		whenToUseKeys: ['headersInspector.headers.ifNoneMatch.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.ifNoneMatch.mistakes1']
	},
	{
		name: 'Expires',
		normalizedName: 'expires',
		shortDescription: 'Date/time after which response is stale',
		descriptionKey: 'headersInspector.headers.expires.description',
		category: 'caching',
		whenToUseKeys: ['headersInspector.headers.expires.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.expires.mistakes1']
	},
	{
		name: 'Vary',
		normalizedName: 'vary',
		shortDescription: 'Headers that affect response selection',
		descriptionKey: 'headersInspector.headers.vary.description',
		category: 'caching',
		whenToUseKeys: ['headersInspector.headers.vary.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.vary.mistakes1']
	},
	// CORS
	{
		name: 'Origin',
		normalizedName: 'origin',
		shortDescription: 'Origin of the request',
		descriptionKey: 'headersInspector.headers.origin.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.origin.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Access-Control-Allow-Origin',
		normalizedName: 'access-control-allow-origin',
		shortDescription: 'Specifies allowed origins for CORS',
		descriptionKey: 'headersInspector.headers.accessControlAllowOrigin.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.accessControlAllowOrigin.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.accessControlAllowOrigin.mistakes1',
			'headersInspector.headers.accessControlAllowOrigin.mistakes2'
		]
	},
	{
		name: 'Access-Control-Allow-Credentials',
		normalizedName: 'access-control-allow-credentials',
		shortDescription: 'Indicates if credentials can be included',
		descriptionKey: 'headersInspector.headers.accessControlAllowCredentials.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.accessControlAllowCredentials.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.accessControlAllowCredentials.mistakes1']
	},
	{
		name: 'Access-Control-Allow-Headers',
		normalizedName: 'access-control-allow-headers',
		shortDescription: 'Headers allowed in CORS requests',
		descriptionKey: 'headersInspector.headers.accessControlAllowHeaders.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.accessControlAllowHeaders.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Access-Control-Allow-Methods',
		normalizedName: 'access-control-allow-methods',
		shortDescription: 'HTTP methods allowed in CORS requests',
		descriptionKey: 'headersInspector.headers.accessControlAllowMethods.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.accessControlAllowMethods.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Access-Control-Expose-Headers',
		normalizedName: 'access-control-expose-headers',
		shortDescription: 'Headers exposed to JavaScript',
		descriptionKey: 'headersInspector.headers.accessControlExposeHeaders.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.accessControlExposeHeaders.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Access-Control-Max-Age',
		normalizedName: 'access-control-max-age',
		shortDescription: 'Time in seconds to cache CORS preflight response',
		descriptionKey: 'headersInspector.headers.accessControlMaxAge.description',
		category: 'cors',
		whenToUseKeys: ['headersInspector.headers.accessControlMaxAge.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.accessControlMaxAge.mistakes1',
			'headersInspector.headers.accessControlMaxAge.mistakes2'
		],
		securityNotesKey: 'headersInspector.headers.accessControlMaxAge.security'
	},
	// Cookies
	{
		name: 'Set-Cookie',
		normalizedName: 'set-cookie',
		shortDescription: 'Sets a cookie in the browser',
		descriptionKey: 'headersInspector.headers.setCookie.description',
		category: 'cookies',
		whenToUseKeys: ['headersInspector.headers.setCookie.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.setCookie.mistakes1',
			'headersInspector.headers.setCookie.mistakes2',
			'headersInspector.headers.setCookie.mistakes3'
		],
		securityNotesKey: 'headersInspector.headers.setCookie.security'
	},
	{
		name: 'Cookie',
		normalizedName: 'cookie',
		shortDescription: 'Contains stored cookies for the domain',
		descriptionKey: 'headersInspector.headers.cookie.description',
		category: 'cookies',
		whenToUseKeys: ['headersInspector.headers.cookie.whenToUse1'],
		commonMistakesKeys: []
	},
	// Security
	{
		name: 'Content-Security-Policy',
		normalizedName: 'content-security-policy',
		shortDescription: 'Controls resources the browser can load',
		descriptionKey: 'headersInspector.headers.contentSecurityPolicy.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.contentSecurityPolicy.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.contentSecurityPolicy.mistakes1'],
		securityNotesKey: 'headersInspector.headers.contentSecurityPolicy.security'
	},
	{
		name: 'Strict-Transport-Security',
		normalizedName: 'strict-transport-security',
		shortDescription: 'Forces HTTPS connections',
		descriptionKey: 'headersInspector.headers.strictTransportSecurity.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.strictTransportSecurity.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.strictTransportSecurity.mistakes1'],
		securityNotesKey: 'headersInspector.headers.strictTransportSecurity.security'
	},
	{
		name: 'X-Frame-Options',
		normalizedName: 'x-frame-options',
		shortDescription: 'Prevents clickjacking attacks',
		descriptionKey: 'headersInspector.headers.xFrameOptions.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.xFrameOptions.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.xFrameOptions.mistakes1']
	},
	{
		name: 'X-Content-Type-Options',
		normalizedName: 'x-content-type-options',
		shortDescription: 'Prevents MIME type sniffing',
		descriptionKey: 'headersInspector.headers.xContentTypeOptions.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.xContentTypeOptions.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.xContentTypeOptions.mistakes1']
	},
	{
		name: 'Referrer-Policy',
		normalizedName: 'referrer-policy',
		shortDescription: 'Controls referrer information sent',
		descriptionKey: 'headersInspector.headers.referrerPolicy.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.referrerPolicy.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Permissions-Policy',
		normalizedName: 'permissions-policy',
		shortDescription: 'Controls browser features and APIs',
		descriptionKey: 'headersInspector.headers.permissionsPolicy.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.permissionsPolicy.whenToUse1'],
		commonMistakesKeys: []
	},
	// Redirection
	{
		name: 'Location',
		normalizedName: 'location',
		shortDescription: 'URL for redirection',
		descriptionKey: 'headersInspector.headers.location.description',
		category: 'redirection',
		whenToUseKeys: ['headersInspector.headers.location.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.location.mistakes1']
	},
	{
		name: 'Retry-After',
		normalizedName: 'retry-after',
		shortDescription: 'Time to wait before retrying',
		descriptionKey: 'headersInspector.headers.retryAfter.description',
		category: 'redirection',
		whenToUseKeys: ['headersInspector.headers.retryAfter.whenToUse1'],
		commonMistakesKeys: []
	},
	// Forwarding
	{
		name: 'X-Forwarded-For',
		normalizedName: 'x-forwarded-for',
		shortDescription: 'Original client IP address',
		descriptionKey: 'headersInspector.headers.xForwardedFor.description',
		category: 'forwarding',
		whenToUseKeys: ['headersInspector.headers.xForwardedFor.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.xForwardedFor.mistakes1']
	},
	{
		name: 'X-Forwarded-Proto',
		normalizedName: 'x-forwarded-proto',
		shortDescription: 'Original protocol (http/https)',
		descriptionKey: 'headersInspector.headers.xForwardedProto.description',
		category: 'forwarding',
		whenToUseKeys: ['headersInspector.headers.xForwardedProto.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Forwarded',
		normalizedName: 'forwarded',
		shortDescription: 'Standardized proxy information',
		descriptionKey: 'headersInspector.headers.forwarded.description',
		category: 'forwarding',
		whenToUseKeys: ['headersInspector.headers.forwarded.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Server-Timing',
		normalizedName: 'server-timing',
		shortDescription: 'Performance metrics from server',
		descriptionKey: 'headersInspector.headers.serverTiming.description',
		category: 'other',
		whenToUseKeys: ['headersInspector.headers.serverTiming.whenToUse1'],
		commonMistakesKeys: []
	},
	{
		name: 'Referer',
		normalizedName: 'referer',
		shortDescription: 'URL of the page that linked to the resource',
		descriptionKey: 'headersInspector.headers.referer.description',
		category: 'other',
		whenToUseKeys: ['headersInspector.headers.referer.whenToUse1'],
		commonMistakesKeys: [
			'headersInspector.headers.referer.mistakes1',
			'headersInspector.headers.referer.mistakes2'
		],
		securityNotesKey: 'headersInspector.headers.referer.security'
	},
	{
		name: 'User-Agent',
		normalizedName: 'user-agent',
		shortDescription: 'Identifies the client application or browser',
		descriptionKey: 'headersInspector.headers.userAgent.description',
		category: 'other',
		whenToUseKeys: ['headersInspector.headers.userAgent.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.userAgent.mistakes1'],
		securityNotesKey: 'headersInspector.headers.userAgent.security'
	},
	{
		name: 'Pragma',
		normalizedName: 'pragma',
		shortDescription: 'Legacy cache control directive',
		descriptionKey: 'headersInspector.headers.pragma.description',
		category: 'caching',
		whenToUseKeys: ['headersInspector.headers.pragma.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.pragma.mistakes1']
	},
	{
		name: 'Date',
		normalizedName: 'date',
		shortDescription: 'Date and time when the message was originated',
		descriptionKey: 'headersInspector.headers.date.description',
		category: 'other',
		whenToUseKeys: ['headersInspector.headers.date.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.date.mistakes1']
	},
	{
		name: 'Server',
		normalizedName: 'server',
		shortDescription: 'Information about the server software',
		descriptionKey: 'headersInspector.headers.server.description',
		category: 'other',
		whenToUseKeys: ['headersInspector.headers.server.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.server.mistakes1']
	},
	{
		name: 'X-Envoy-Upstream-Service-Time',
		normalizedName: 'x-envoy-upstream-service-time',
		shortDescription: 'Time taken by upstream service in Envoy proxy',
		descriptionKey: 'headersInspector.headers.xEnvoyUpstreamServiceTime.description',
		category: 'forwarding',
		whenToUseKeys: ['headersInspector.headers.xEnvoyUpstreamServiceTime.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.xEnvoyUpstreamServiceTime.mistakes1']
	},
	{
		name: 'X-XSS-Protection',
		normalizedName: 'x-xss-protection',
		shortDescription: 'Enables XSS filter in older browsers',
		descriptionKey: 'headersInspector.headers.xXssProtection.description',
		category: 'security',
		whenToUseKeys: ['headersInspector.headers.xXssProtection.whenToUse1'],
		commonMistakesKeys: ['headersInspector.headers.xXssProtection.mistakes1'],
		securityNotesKey: 'headersInspector.headers.xXssProtection.security'
	}
];

export function getHeaderInfo(normalizedName: string): HeaderInfo | undefined {
	return headerKnowledgeBase.find((h) => h.normalizedName === normalizedName);
}

export function getAllHeaderInfos(): HeaderInfo[] {
	return headerKnowledgeBase;
}

