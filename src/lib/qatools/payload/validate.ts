export interface ValidationError {
	line?: number;
	column?: number;
	message: string;
	path?: string;
}

export interface BracketInfo {
	char: string;
	line: number;
	column: number;
	position: number;
}

export interface BracketBalance {
	isBalanced: boolean;
	brackets: {
		open: number;
		close: number;
	};
	braces: {
		open: number;
		close: number;
	};
	unclosed: BracketInfo[];
	unexpected: BracketInfo[];
}

export function validateJson(jsonString: string): { valid: boolean; error?: ValidationError; json?: any } {
	try {
		const json = JSON.parse(jsonString);
		return { valid: true, json };
	} catch (error) {
		if (error instanceof SyntaxError) {
			const match = error.message.match(/position (\d+)/);
			const position = match ? parseInt(match[1], 10) : 0;
			const lines = jsonString.substring(0, position).split('\n');
			const line = lines.length;
			const column = lines[lines.length - 1].length + 1;

			return {
				valid: false,
				error: {
					line,
					column,
					message: error.message
				}
			};
		}

		return {
			valid: false,
			error: {
				message: error instanceof Error ? error.message : 'Unknown error'
			}
		};
	}
}

export function formatJson(json: any, minify: boolean = false): string {
	if (minify) {
		return JSON.stringify(json);
	}
	return JSON.stringify(json, null, 2);
}

export function checkBracketBalance(input: string): BracketBalance {
	const result: BracketBalance = {
		isBalanced: true,
		brackets: { open: 0, close: 0 },
		braces: { open: 0, close: 0 },
		unclosed: [],
		unexpected: []
	};

	const stack: BracketInfo[] = [];
	let inString = false;
	let escape = false;
	let line = 1;
	let column = 1;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		if (char === '\n') {
			line++;
			column = 1;
			escape = false;
			continue;
		}

		if (!escape && char === '"') {
			inString = !inString;
		}
		escape = inString && !escape && char === '\\';

		if (!inString) {
			const info: BracketInfo = { char, line, column, position: i };

			if (char === '[') {
				result.brackets.open++;
				stack.push(info);
			} else if (char === '{') {
				result.braces.open++;
				stack.push(info);
			} else if (char === ']') {
				result.brackets.close++;
				const last = stack[stack.length - 1];
				if (last?.char === '[') {
					stack.pop();
				} else {
					result.unexpected.push(info);
					result.isBalanced = false;
				}
			} else if (char === '}') {
				result.braces.close++;
				const last = stack[stack.length - 1];
				if (last?.char === '{') {
					stack.pop();
				} else {
					result.unexpected.push(info);
					result.isBalanced = false;
				}
			}
		}

		column++;
	}

	if (stack.length > 0) {
		result.unclosed = stack;
		result.isBalanced = false;
	}

	return result;
}

export function getBracketBalanceMessage(balance: BracketBalance): string | null {
	if (balance.isBalanced) return null;

	const messages: string[] = [];

	if (balance.unclosed.length > 0) {
		const unclosedList = balance.unclosed
			.map((b) => `Unclosed ${b.char} at line ${b.line}, column ${b.column}`)
			.join('; ');
		messages.push(unclosedList);
	}

	if (balance.unexpected.length > 0) {
		const unexpectedList = balance.unexpected
			.map((b) => `Unexpected ${b.char} at line ${b.line}, column ${b.column}`)
			.join('; ');
		messages.push(unexpectedList);
	}

	if (balance.brackets.open !== balance.brackets.close) {
		messages.push(
			`Square brackets: ${balance.brackets.open}× "[" and ${balance.brackets.close}× "]"`
		);
	}
	if (balance.braces.open !== balance.braces.close) {
		messages.push(
			`Curly braces: ${balance.braces.open}× "{" and ${balance.braces.close}× "}"`
		);
	}

	return messages.join('. ');
}
