export interface Preset {
	id: string;
	name: string;
	schema: string;
	payload: string;
}

export const presets: Preset[] = [
	{
		id: 'login',
		name: 'Login Request',
		schema: JSON.stringify({
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			type: 'object',
			properties: {
				email: {
					type: 'string',
					format: 'email',
					minLength: 1
				},
				password: {
					type: 'string',
					minLength: 8
				}
			},
			required: ['email', 'password'],
			additionalProperties: false
		}, null, 2),
		payload: JSON.stringify({
			email: 'user@example.com',
			password: 'SecurePass123!'
		}, null, 2)
	},
	{
		id: 'create-user',
		name: 'Create User',
		schema: JSON.stringify({
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			type: 'object',
			properties: {
				email: {
					type: 'string',
					format: 'email'
				},
				password: {
					type: 'string',
					minLength: 8,
					maxLength: 128
				},
				name: {
					type: 'string',
					minLength: 2,
					maxLength: 100
				},
				age: {
					type: 'number',
					minimum: 18,
					maximum: 120
				},
				role: {
					type: 'string',
					enum: ['user', 'admin', 'moderator']
				}
			},
			required: ['email', 'password', 'name'],
			additionalProperties: false
		}, null, 2),
		payload: JSON.stringify({
			email: 'newuser@example.com',
			password: 'SecurePass123!',
			name: 'John Doe',
			age: 25,
			role: 'user'
		}, null, 2)
	},
	{
		id: 'order',
		name: 'Order',
		schema: JSON.stringify({
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			type: 'object',
			properties: {
				userId: {
					type: 'string'
				},
				items: {
					type: 'array',
					minItems: 1,
					items: {
						type: 'object',
						properties: {
							productId: {
								type: 'string'
							},
							quantity: {
								type: 'number',
								minimum: 1
							},
							price: {
								type: 'number',
								minimum: 0
							}
						},
						required: ['productId', 'quantity', 'price'],
						additionalProperties: false
					}
				},
				shipping: {
					type: 'object',
					properties: {
						address: {
							type: 'string'
						},
						city: {
							type: 'string'
						},
						zipCode: {
							type: 'string',
							pattern: '^[0-9]{5}(-[0-9]{4})?$'
						},
						country: {
							type: 'string',
							minLength: 2,
							maxLength: 2
						}
					},
					required: ['address', 'city', 'zipCode', 'country'],
					additionalProperties: false
				}
			},
			required: ['userId', 'items', 'shipping'],
			additionalProperties: false
		}, null, 2),
		payload: JSON.stringify({
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
			}
		}, null, 2)
	},
	{
		id: 'webhook',
		name: 'Webhook Event',
		schema: JSON.stringify({
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			type: 'object',
			properties: {
				event: {
					type: 'string',
					enum: ['user.created', 'user.updated', 'user.deleted', 'order.placed', 'order.cancelled']
				},
				timestamp: {
					type: 'string',
					format: 'date-time'
				},
				data: {
					type: 'object'
				},
				signature: {
					type: 'string'
				}
			},
			required: ['event', 'timestamp', 'data', 'signature'],
			additionalProperties: false
		}, null, 2),
		payload: JSON.stringify({
			event: 'user.created',
			timestamp: '2024-01-15T10:30:00Z',
			data: {
				userId: 'user-456',
				email: 'new@example.com'
			},
			signature: 'sha256=abc123...'
		}, null, 2)
	}
];

export function getPreset(id: string): Preset | undefined {
	return presets.find(p => p.id === id);
}

