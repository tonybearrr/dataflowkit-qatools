import type { PayloadTemplate } from './types';

export const templates: PayloadTemplate[] = [
	{
		id: 'login',
		name: 'Login Request',
		description: 'User authentication payload',
		payload: {
			email: 'user@example.com',
			password: 'SecurePass123!'
		},
		metadata: {
			email: {
				required: true,
				constraints: {
					pattern: '^[^@]+@[^@]+\\.[^@]+$'
				}
			},
			password: {
				required: true,
				constraints: {
					minLen: 8
				}
			}
		}
	},
	{
		id: 'create-user',
		name: 'Create User',
		description: 'User registration payload',
		payload: {
			email: 'newuser@example.com',
			password: 'SecurePass123!',
			name: 'John Doe',
			age: 25,
			role: 'user'
		},
		metadata: {
			email: {
				required: true,
				constraints: {
					pattern: '^[^@]+@[^@]+\\.[^@]+$'
				}
			},
			password: {
				required: true,
				constraints: {
					minLen: 8
				}
			},
			name: {
				required: true,
				constraints: {
					minLen: 2
				}
			},
			age: {
				required: false,
				constraints: {
					min: 18,
					max: 120
				}
			},
			role: {
				required: true,
				constraints: {
					enum: ['user', 'admin', 'moderator']
				}
			}
		}
	},
	{
		id: 'update-profile',
		name: 'Update Profile',
		description: 'User profile update payload',
		payload: {
			name: 'Jane Smith',
			bio: 'Software developer',
			avatar: 'https://example.com/avatar.jpg',
			preferences: {
				theme: 'dark',
				notifications: true
			}
		},
		metadata: {
			name: {
				required: false,
				constraints: {
					minLen: 2,
					maxLen: 100
				}
			},
			bio: {
				required: false,
				constraints: {
					maxLen: 500
				}
			},
			preferences: {
				required: false
			},
			'preferences.theme': {
				required: false,
				constraints: {
					enum: ['light', 'dark', 'auto']
				}
			}
		}
	},
	{
		id: 'create-order',
		name: 'Create Order',
		description: 'E-commerce order creation payload',
		payload: {
			userId: 'user-123',
			items: [
				{
					productId: 'prod-1',
					quantity: 2,
					price: 29.99
				},
				{
					productId: 'prod-2',
					quantity: 1,
					price: 49.99
				}
			],
			shipping: {
				address: '123 Main St',
				city: 'New York',
				zipCode: '10001',
				country: 'US'
			},
			total: 109.97
		},
		metadata: {
			userId: {
				required: true
			},
			items: {
				required: true
			},
			'items[].productId': {
				required: true
			},
			'items[].quantity': {
				required: true,
				constraints: {
					min: 1
				}
			},
			'items[].price': {
				required: true,
				constraints: {
					min: 0
				}
			},
			shipping: {
				required: true
			},
			'shipping.address': {
				required: true
			},
			'shipping.city': {
				required: true
			},
			'shipping.zipCode': {
				required: true
			},
			'shipping.country': {
				required: true,
				constraints: {
					enum: ['US', 'CA', 'UK', 'DE', 'FR']
				}
			},
			total: {
				required: true,
				constraints: {
					min: 0
				}
			}
		}
	},
	{
		id: 'search-filter',
		name: 'Search/Filter Request',
		description: 'Search with pagination and sorting',
		payload: {
			query: 'laptop',
			filters: {
				category: 'electronics',
				minPrice: 100,
				maxPrice: 1000,
				inStock: true
			},
			sort: {
				field: 'price',
				order: 'asc'
			},
			pagination: {
				page: 1,
				perPage: 20
			}
		},
		metadata: {
			query: {
				required: false,
				constraints: {
					maxLen: 200
				}
			},
			filters: {
				required: false
			},
			'filters.category': {
				required: false,
				constraints: {
					enum: ['electronics', 'clothing', 'books', 'food']
				}
			},
			'filters.minPrice': {
				required: false,
				constraints: {
					min: 0
				}
			},
			'filters.maxPrice': {
				required: false,
				constraints: {
					min: 0
				}
			},
			sort: {
				required: false
			},
			'sort.field': {
				required: false,
				constraints: {
					enum: ['price', 'name', 'rating', 'date']
				}
			},
			'sort.order': {
				required: false,
				constraints: {
					enum: ['asc', 'desc']
				}
			},
			pagination: {
				required: false
			},
			'pagination.page': {
				required: false,
				constraints: {
					min: 1
				}
			},
			'pagination.perPage': {
				required: false,
				constraints: {
					min: 1,
					max: 100
				}
			}
		}
	},
	{
		id: 'webhook-event',
		name: 'Webhook Event Payload',
		description: 'Generic webhook event structure',
		payload: {
			event: 'user.created',
			timestamp: '2024-01-15T10:30:00Z',
			data: {
				userId: 'user-456',
				email: 'webhook@example.com',
				metadata: {
					source: 'api',
					ip: '192.168.1.1'
				}
			},
			signature: 'sha256=abc123...'
		},
		metadata: {
			event: {
				required: true,
				constraints: {
					enum: ['user.created', 'user.updated', 'user.deleted', 'order.created', 'payment.completed']
				}
			},
			timestamp: {
				required: true
			},
			data: {
				required: true
			},
			'data.userId': {
				required: true
			},
			'data.email': {
				required: true,
				constraints: {
					pattern: '^[^@]+@[^@]+\\.[^@]+$'
				}
			},
			signature: {
				required: false
			}
		}
	}
];

export function getTemplate(id: string): PayloadTemplate | undefined {
	return templates.find((t) => t.id === id);
}
