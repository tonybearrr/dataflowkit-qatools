import type { StatusCode } from './types';

export const statusCodes: StatusCode[] = [
	// 1xx Informational
	{
		code: 100,
		phrase: 'Continue',
		category: '1xx',
		label: 'informational',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.100.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.100.whenToUse1', 'statusCodeReference.statusCodes.100.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.100.causes1', 'statusCodeReference.statusCodes.100.causes2'],
		returnTemplate: {
			status: 100,
			body: {}
		},
		checklistKeys: ['statusCodeReference.statusCodes.100.checklist1', 'statusCodeReference.statusCodes.100.checklist2'],
		related: [101]
	},
	{
		code: 101,
		phrase: 'Switching Protocols',
		category: '1xx',
		label: 'informational',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.101.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.101.whenToUse1', 'statusCodeReference.statusCodes.101.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.101.causes1'],
		returnTemplate: {
			status: 101,
			body: {}
		},
		checklistKeys: ['statusCodeReference.statusCodes.101.checklist1'],
		related: [100]
	},
	// 2xx Success
	{
		code: 200,
		phrase: 'OK',
		category: '2xx',
		label: 'success',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.200.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.200.whenToUse1', 'statusCodeReference.statusCodes.200.whenToUse2', 'statusCodeReference.statusCodes.200.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.200.causes1', 'statusCodeReference.statusCodes.200.causes2'],
		returnTemplate: {
			status: 200,
			body: {
				data: {}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.200.checklist1', 'statusCodeReference.statusCodes.200.checklist2', 'statusCodeReference.statusCodes.200.checklist3'],
		related: [201, 204]
	},
	{
		code: 201,
		phrase: 'Created',
		category: '2xx',
		label: 'success',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.201.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.201.whenToUse1', 'statusCodeReference.statusCodes.201.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.201.causes1', 'statusCodeReference.statusCodes.201.causes2'],
		returnTemplate: {
			status: 201,
			body: {
				id: 'resource-id',
				message: 'Resource created successfully'
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.201.checklist1', 'statusCodeReference.statusCodes.201.checklist2', 'statusCodeReference.statusCodes.201.checklist3'],
		related: [200, 202, 204]
	},
	{
		code: 202,
		phrase: 'Accepted',
		category: '2xx',
		label: 'success',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.202.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.202.whenToUse1', 'statusCodeReference.statusCodes.202.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.202.causes1'],
		returnTemplate: {
			status: 202,
			body: {
				message: 'Request accepted for processing',
				requestId: 'req-123'
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.202.checklist1', 'statusCodeReference.statusCodes.202.checklist2'],
		related: [200, 201]
	},
	{
		code: 204,
		phrase: 'No Content',
		category: '2xx',
		label: 'success',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.204.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.204.whenToUse1', 'statusCodeReference.statusCodes.204.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.204.causes1'],
		returnTemplate: {
			status: 204,
			body: null
		},
		checklistKeys: ['statusCodeReference.statusCodes.204.checklist1', 'statusCodeReference.statusCodes.204.checklist2'],
		related: [200]
	},
	// 3xx Redirection
	{
		code: 301,
		phrase: 'Moved Permanently',
		category: '3xx',
		label: 'redirection',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.301.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.301.whenToUse1', 'statusCodeReference.statusCodes.301.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.301.causes1', 'statusCodeReference.statusCodes.301.causes2'],
		returnTemplate: {
			status: 301,
			body: {
				message: 'Resource moved permanently',
				location: 'https://example.com/new-url'
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.301.checklist1', 'statusCodeReference.statusCodes.301.checklist2'],
		related: [302, 308]
	},
	{
		code: 302,
		phrase: 'Found',
		category: '3xx',
		label: 'redirection',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.302.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.302.whenToUse1', 'statusCodeReference.statusCodes.302.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.302.causes1', 'statusCodeReference.statusCodes.302.causes2'],
		returnTemplate: {
			status: 302,
			body: {
				message: 'Resource found at different location',
				location: 'https://example.com/temporary-url'
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.302.checklist1', 'statusCodeReference.statusCodes.302.checklist2'],
		related: [301, 307]
	},
	{
		code: 304,
		phrase: 'Not Modified',
		category: '3xx',
		label: 'redirection',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.304.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.304.whenToUse1', 'statusCodeReference.statusCodes.304.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.304.causes1'],
		returnTemplate: {
			status: 304,
			body: null
		},
		checklistKeys: ['statusCodeReference.statusCodes.304.checklist1', 'statusCodeReference.statusCodes.304.checklist2'],
		related: [200]
	},
	{
		code: 307,
		phrase: 'Temporary Redirect',
		category: '3xx',
		label: 'redirection',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.307.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.307.whenToUse1', 'statusCodeReference.statusCodes.307.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.307.causes1'],
		returnTemplate: {
			status: 307,
			body: {
				location: 'https://example.com/temp-redirect'
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.307.checklist1'],
		related: [302, 308]
	},
	{
		code: 308,
		phrase: 'Permanent Redirect',
		category: '3xx',
		label: 'redirection',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.308.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.308.whenToUse1', 'statusCodeReference.statusCodes.308.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.308.causes1'],
		returnTemplate: {
			status: 308,
			body: {
				location: 'https://example.com/permanent-redirect'
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.308.checklist1'],
		related: [301]
	},
	// 4xx Client Error
	{
		code: 400,
		phrase: 'Bad Request',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.400.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.400.whenToUse1', 'statusCodeReference.statusCodes.400.whenToUse2', 'statusCodeReference.statusCodes.400.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.400.causes1', 'statusCodeReference.statusCodes.400.causes2', 'statusCodeReference.statusCodes.400.causes3', 'statusCodeReference.statusCodes.400.causes4'],
		returnTemplate: {
			status: 400,
			body: {
				error: {
					code: 'BAD_REQUEST',
					message: 'Invalid request syntax or parameters',
					details: 'Check request format and required fields',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.400.checklist1', 'statusCodeReference.statusCodes.400.checklist2', 'statusCodeReference.statusCodes.400.checklist3', 'statusCodeReference.statusCodes.400.checklist4'],
		related: [401, 422]
	},
	{
		code: 401,
		phrase: 'Unauthorized',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.401.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.401.whenToUse1', 'statusCodeReference.statusCodes.401.whenToUse2', 'statusCodeReference.statusCodes.401.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.401.causes1', 'statusCodeReference.statusCodes.401.causes2', 'statusCodeReference.statusCodes.401.causes3'],
		returnTemplate: {
			status: 401,
			body: {
				error: {
					code: 'UNAUTHORIZED',
					message: 'Authentication required',
					details: 'Valid authentication token is missing or invalid',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.401.checklist1', 'statusCodeReference.statusCodes.401.checklist2', 'statusCodeReference.statusCodes.401.checklist3', 'statusCodeReference.statusCodes.401.checklist4'],
		related: [403, 400]
	},
	{
		code: 403,
		phrase: 'Forbidden',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.403.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.403.whenToUse1', 'statusCodeReference.statusCodes.403.whenToUse2', 'statusCodeReference.statusCodes.403.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.403.causes1', 'statusCodeReference.statusCodes.403.causes2', 'statusCodeReference.statusCodes.403.causes3'],
		returnTemplate: {
			status: 403,
			body: {
				error: {
					code: 'FORBIDDEN',
					message: 'Access denied',
					details: 'You do not have permission to access this resource',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.403.checklist1', 'statusCodeReference.statusCodes.403.checklist2', 'statusCodeReference.statusCodes.403.checklist3'],
		related: [401, 404]
	},
	{
		code: 404,
		phrase: 'Not Found',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.404.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.404.whenToUse1', 'statusCodeReference.statusCodes.404.whenToUse2', 'statusCodeReference.statusCodes.404.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.404.causes1', 'statusCodeReference.statusCodes.404.causes2', 'statusCodeReference.statusCodes.404.causes3', 'statusCodeReference.statusCodes.404.causes4'],
		returnTemplate: {
			status: 404,
			body: {
				error: {
					code: 'NOT_FOUND',
					message: 'Resource not found',
					details: 'The requested resource does not exist',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.404.checklist1', 'statusCodeReference.statusCodes.404.checklist2', 'statusCodeReference.statusCodes.404.checklist3'],
		related: [400, 410]
	},
	{
		code: 405,
		phrase: 'Method Not Allowed',
		category: '4xx',
		label: 'clientError',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.405.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.405.whenToUse1', 'statusCodeReference.statusCodes.405.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.405.causes1', 'statusCodeReference.statusCodes.405.causes2'],
		returnTemplate: {
			status: 405,
			body: {
				error: {
					code: 'METHOD_NOT_ALLOWED',
					message: 'HTTP method not allowed for this endpoint',
					details: 'Allowed methods: GET, POST',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.405.checklist1', 'statusCodeReference.statusCodes.405.checklist2'],
		related: [400, 404]
	},
	{
		code: 408,
		phrase: 'Request Timeout',
		category: '4xx',
		label: 'clientError',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.408.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.408.whenToUse1', 'statusCodeReference.statusCodes.408.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.408.causes1', 'statusCodeReference.statusCodes.408.causes2'],
		returnTemplate: {
			status: 408,
			body: {
				error: {
					code: 'REQUEST_TIMEOUT',
					message: 'Request timeout',
					details: 'The request took too long to complete',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.408.checklist1', 'statusCodeReference.statusCodes.408.checklist2'],
		related: [400, 504]
	},
	{
		code: 409,
		phrase: 'Conflict',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.409.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.409.whenToUse1', 'statusCodeReference.statusCodes.409.whenToUse2', 'statusCodeReference.statusCodes.409.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.409.causes1', 'statusCodeReference.statusCodes.409.causes2', 'statusCodeReference.statusCodes.409.causes3'],
		returnTemplate: {
			status: 409,
			body: {
				error: {
					code: 'CONFLICT',
					message: 'Resource conflict',
					details: 'The request conflicts with the current state of the resource',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.409.checklist1', 'statusCodeReference.statusCodes.409.checklist2', 'statusCodeReference.statusCodes.409.checklist3'],
		related: [422, 400]
	},
	{
		code: 410,
		phrase: 'Gone',
		category: '4xx',
		label: 'clientError',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.410.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.410.whenToUse1', 'statusCodeReference.statusCodes.410.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.410.causes1', 'statusCodeReference.statusCodes.410.causes2'],
		returnTemplate: {
			status: 410,
			body: {
				error: {
					code: 'GONE',
					message: 'Resource is no longer available',
					details: 'The resource has been permanently removed',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.410.checklist1', 'statusCodeReference.statusCodes.410.checklist2'],
		related: [404]
	},
	{
		code: 412,
		phrase: 'Precondition Failed',
		category: '4xx',
		label: 'clientError',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.412.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.412.whenToUse1', 'statusCodeReference.statusCodes.412.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.412.causes1', 'statusCodeReference.statusCodes.412.causes2'],
		returnTemplate: {
			status: 412,
			body: {
				error: {
					code: 'PRECONDITION_FAILED',
					message: 'Precondition failed',
					details: 'One or more conditions in the request header fields evaluated to false',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.412.checklist1', 'statusCodeReference.statusCodes.412.checklist2'],
		related: [400, 409]
	},
	{
		code: 413,
		phrase: 'Payload Too Large',
		category: '4xx',
		label: 'clientError',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.413.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.413.whenToUse1', 'statusCodeReference.statusCodes.413.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.413.causes1', 'statusCodeReference.statusCodes.413.causes2'],
		returnTemplate: {
			status: 413,
			body: {
				error: {
					code: 'PAYLOAD_TOO_LARGE',
					message: 'Request payload too large',
					details: 'Maximum payload size: 10MB',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.413.checklist1', 'statusCodeReference.statusCodes.413.checklist2'],
		related: [400]
	},
	{
		code: 415,
		phrase: 'Unsupported Media Type',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.415.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.415.whenToUse1', 'statusCodeReference.statusCodes.415.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.415.causes1', 'statusCodeReference.statusCodes.415.causes2'],
		returnTemplate: {
			status: 415,
			body: {
				error: {
					code: 'UNSUPPORTED_MEDIA_TYPE',
					message: 'Unsupported media type',
					details: 'Content-Type application/xml is not supported. Use application/json',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.415.checklist1', 'statusCodeReference.statusCodes.415.checklist2'],
		related: [400]
	},
	{
		code: 422,
		phrase: 'Unprocessable Entity',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.422.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.422.whenToUse1', 'statusCodeReference.statusCodes.422.whenToUse2', 'statusCodeReference.statusCodes.422.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.422.causes1', 'statusCodeReference.statusCodes.422.causes2', 'statusCodeReference.statusCodes.422.causes3'],
		returnTemplate: {
			status: 422,
			body: {
				error: {
					code: 'UNPROCESSABLE_ENTITY',
					message: 'Validation failed',
					details: {
						field: 'email',
						reason: 'Invalid email format'
					},
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.422.checklist1', 'statusCodeReference.statusCodes.422.checklist2', 'statusCodeReference.statusCodes.422.checklist3', 'statusCodeReference.statusCodes.422.checklist4'],
		related: [400, 409]
	},
	{
		code: 429,
		phrase: 'Too Many Requests',
		category: '4xx',
		label: 'clientError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.429.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.429.whenToUse1', 'statusCodeReference.statusCodes.429.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.429.causes1', 'statusCodeReference.statusCodes.429.causes2', 'statusCodeReference.statusCodes.429.causes3'],
		returnTemplate: {
			status: 429,
			body: {
				error: {
					code: 'TOO_MANY_REQUESTS',
					message: 'Rate limit exceeded',
					details: 'Too many requests. Retry after 60 seconds',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z',
					retryAfter: 60
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.429.checklist1', 'statusCodeReference.statusCodes.429.checklist2', 'statusCodeReference.statusCodes.429.checklist3'],
		related: [400, 503]
	},
	// 5xx Server Error
	{
		code: 500,
		phrase: 'Internal Server Error',
		category: '5xx',
		label: 'serverError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.500.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.500.whenToUse1', 'statusCodeReference.statusCodes.500.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.500.causes1', 'statusCodeReference.statusCodes.500.causes2', 'statusCodeReference.statusCodes.500.causes3', 'statusCodeReference.statusCodes.500.causes4'],
		returnTemplate: {
			status: 500,
			body: {
				error: {
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An unexpected error occurred',
					details: 'Please try again later or contact support',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.500.checklist1', 'statusCodeReference.statusCodes.500.checklist2', 'statusCodeReference.statusCodes.500.checklist3'],
		related: [502, 503]
	},
	{
		code: 501,
		phrase: 'Not Implemented',
		category: '5xx',
		label: 'serverError',
		common: false,
		summaryKey: 'statusCodeReference.statusCodes.501.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.501.whenToUse1', 'statusCodeReference.statusCodes.501.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.501.causes1'],
		returnTemplate: {
			status: 501,
			body: {
				error: {
					code: 'NOT_IMPLEMENTED',
					message: 'Feature not implemented',
					details: 'This endpoint is not yet available',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.501.checklist1', 'statusCodeReference.statusCodes.501.checklist2'],
		related: [500, 404]
	},
	{
		code: 502,
		phrase: 'Bad Gateway',
		category: '5xx',
		label: 'serverError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.502.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.502.whenToUse1', 'statusCodeReference.statusCodes.502.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.502.causes1', 'statusCodeReference.statusCodes.502.causes2', 'statusCodeReference.statusCodes.502.causes3'],
		returnTemplate: {
			status: 502,
			body: {
				error: {
					code: 'BAD_GATEWAY',
					message: 'Bad gateway',
					details: 'Invalid response from upstream server',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.502.checklist1', 'statusCodeReference.statusCodes.502.checklist2', 'statusCodeReference.statusCodes.502.checklist3'],
		related: [500, 503, 504]
	},
	{
		code: 503,
		phrase: 'Service Unavailable',
		category: '5xx',
		label: 'serverError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.503.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.503.whenToUse1', 'statusCodeReference.statusCodes.503.whenToUse2', 'statusCodeReference.statusCodes.503.whenToUse3'],
		commonCausesKeys: ['statusCodeReference.statusCodes.503.causes1', 'statusCodeReference.statusCodes.503.causes2', 'statusCodeReference.statusCodes.503.causes3'],
		returnTemplate: {
			status: 503,
			body: {
				error: {
					code: 'SERVICE_UNAVAILABLE',
					message: 'Service temporarily unavailable',
					details: 'The service is temporarily down for maintenance',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z',
					retryAfter: 300
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.503.checklist1', 'statusCodeReference.statusCodes.503.checklist2', 'statusCodeReference.statusCodes.503.checklist3'],
		related: [500, 502, 504]
	},
	{
		code: 504,
		phrase: 'Gateway Timeout',
		category: '5xx',
		label: 'serverError',
		common: true,
		summaryKey: 'statusCodeReference.statusCodes.504.summary',
		whenToUseKeys: ['statusCodeReference.statusCodes.504.whenToUse1', 'statusCodeReference.statusCodes.504.whenToUse2'],
		commonCausesKeys: ['statusCodeReference.statusCodes.504.causes1', 'statusCodeReference.statusCodes.504.causes2', 'statusCodeReference.statusCodes.504.causes3'],
		returnTemplate: {
			status: 504,
			body: {
				error: {
					code: 'GATEWAY_TIMEOUT',
					message: 'Gateway timeout',
					details: 'The upstream server did not respond in time',
					requestId: 'req-123',
					timestamp: '2024-01-15T10:30:00Z'
				}
			}
		},
		checklistKeys: ['statusCodeReference.statusCodes.504.checklist1', 'statusCodeReference.statusCodes.504.checklist2', 'statusCodeReference.statusCodes.504.checklist3'],
		related: [502, 503, 408]
	}
];

export function getStatusCode(code: number): StatusCode | undefined {
	return statusCodes.find((sc) => sc.code === code);
}

export function getStatusCodesByCategory(category: string): StatusCode[] {
	return statusCodes.filter((sc) => sc.category === category);
}

export function getCommonStatusCodes(): StatusCode[] {
	return statusCodes.filter((sc) => sc.common);
}

export function getRelatedStatusCodes(code: number): StatusCode[] {
	const statusCode = getStatusCode(code);
	if (!statusCode) return [];
	return statusCode.related
		.map((relatedCode) => getStatusCode(relatedCode))
		.filter((sc): sc is StatusCode => sc !== undefined);
}

