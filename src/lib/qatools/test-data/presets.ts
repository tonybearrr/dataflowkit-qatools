import type { FieldSchema } from './types';
import { FieldType } from './types';

export interface Preset {
	name: string;
	description: string;
	schema: FieldSchema[];
}

export const presets: Preset[] = [
	{
		name: 'User',
		description: 'User profile with ID, email, name, phone, and creation date',
		schema: [
			{
				id: '1',
				name: 'id',
				type: FieldType.Uuid,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '2',
				name: 'email',
				type: FieldType.Email,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '3',
				name: 'fullName',
				type: FieldType.Name,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { style: 'full' }
			},
			{
				id: '4',
				name: 'phone',
				type: FieldType.Phone,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '5',
				name: 'createdAt',
				type: FieldType.Date,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { format: 'iso' }
			}
		]
	},
	{
		name: 'Order',
		description: 'E-commerce order with ID, user ID, total, currency, status, and date',
		schema: [
			{
				id: '1',
				name: 'id',
				type: FieldType.Uuid,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '2',
				name: 'userId',
				type: FieldType.Uuid,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '3',
				name: 'total',
				type: FieldType.Number,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { min: 10, max: 10000, integerOnly: false }
			},
			{
				id: '4',
				name: 'currency',
				type: FieldType.Enum,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { values: ['USD', 'EUR', 'UAH', 'GBP'] }
			},
			{
				id: '5',
				name: 'status',
				type: FieldType.Enum,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { values: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] }
			},
			{
				id: '6',
				name: 'createdAt',
				type: FieldType.Date,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { format: 'iso' }
			}
		]
	},
	{
		name: 'Address',
		description: 'Address with street, city, zip, and country',
		schema: [
			{
				id: '1',
				name: 'id',
				type: FieldType.Uuid,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '2',
				name: 'address',
				type: FieldType.Address,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { parts: { city: true, street: true, zip: true, country: true } }
			}
		]
	},
	{
		name: 'Event',
		description: 'Event log with ID, type, payload, and timestamp',
		schema: [
			{
				id: '1',
				name: 'id',
				type: FieldType.Uuid,
				required: true,
				nullable: false,
				nullChance: 0
			},
			{
				id: '2',
				name: 'type',
				type: FieldType.Enum,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { values: ['click', 'view', 'purchase', 'error', 'login'] }
			},
			{
				id: '3',
				name: 'payload',
				type: FieldType.String,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { minLen: 10, maxLen: 100 }
			},
			{
				id: '4',
				name: 'timestamp',
				type: FieldType.Date,
				required: true,
				nullable: false,
				nullChance: 0,
				options: { format: 'ms' }
			}
		]
	}
];
