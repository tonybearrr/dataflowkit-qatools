import { describe, it, expect } from 'vitest';
import { jsonToTree, treeToJson, findNodeById, getPathString } from './treeOps';

describe('treeOps', () => {
	it('should convert JSON to tree', () => {
		const json = { name: 'John', age: 25 };
		const tree = jsonToTree(json);
		expect(tree).toBeDefined();
		expect(tree?.type).toBe('object');
		expect(tree?.children).toBeDefined();
		expect(tree?.children?.length).toBe(2);
	});

	it('should convert tree to JSON', () => {
		const json = { name: 'John', age: 25 };
		const tree = jsonToTree(json);
		const result = treeToJson(tree);
		expect(result).toEqual(json);
	});

	it('should find node by id', () => {
		const json = { name: 'John' };
		const tree = jsonToTree(json);
		if (tree && tree.children && tree.children[0]) {
			const found = findNodeById(tree, tree.children[0].id);
			expect(found).toBeDefined();
			expect(found?.key).toBe('name');
		}
	});

	it('should get path string', () => {
		const json = { user: { email: 'john@example.com' } };
		const tree = jsonToTree(json);
		if (tree && tree.children && tree.children[0] && tree.children[0].children && tree.children[0].children[0]) {
			const path = getPathString(tree, tree.children[0].children[0].id);
			expect(path).toBe('user.email');
		}
	});
});
