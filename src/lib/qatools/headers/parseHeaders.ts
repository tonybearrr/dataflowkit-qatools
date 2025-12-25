import type { ParsedHeader, ParsedHeadersResult } from './types';

export function parseHeaders(
	rawHeaders: string,
	requestType: 'request' | 'response' = 'request'
): ParsedHeadersResult {
	const lines = rawHeaders.split('\n');
	const headers: ParsedHeader[] = [];
	const headerMap = new Map<string, ParsedHeader[]>();
	let currentHeader: { name: string; value: string; line: number } | null = null;
	let lineNumber = 0;

	for (const line of lines) {
		lineNumber++;
		const trimmed = line.trim();
		// Skip empty lines - always ignore them
		if (!trimmed) {
			// If we have a current header, save it before skipping empty line
			if (currentHeader) {
				saveHeader(currentHeader.name, currentHeader.value, currentHeader.line, headerMap);
				currentHeader = null;
			}
			continue;
		}

		// Skip HTTP status line (e.g., "HTTP/1.1 200 OK")
		if (/^HTTP\/\d+\.\d+\s+\d{3}/.test(trimmed)) {
			continue;
		}

		// Skip request line (e.g., "GET /path HTTP/1.1")
		if (/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+\//.test(trimmed)) {
			continue;
		}

		// Check if this is a continuation line (starts with whitespace)
		if (currentHeader && /^\s/.test(line)) {
			currentHeader.value += ' ' + trimmed;
			continue;
		}

		// Parse "Header-Name: value"
		const colonIndex = trimmed.indexOf(':');
		if (colonIndex === -1) {
			continue;
		}

		const name = trimmed.slice(0, colonIndex).trim();
		const value = trimmed.slice(colonIndex + 1).trim();

		if (!name) {
			continue;
		}

		// Save previous header if exists
		if (currentHeader) {
			saveHeader(currentHeader.name, currentHeader.value, currentHeader.line, headerMap);
		}

		currentHeader = { name, value, line: lineNumber };
	}

	// Save last header
	if (currentHeader) {
		saveHeader(currentHeader.name, currentHeader.value, currentHeader.line, headerMap);
	}

	// Convert map to array and count duplicates
	for (const [, headerList] of headerMap.entries()) {
		for (const header of headerList) {
			header.duplicateCount = headerList.length;
			headers.push(header);
		}
	}

	return {
		headers,
		issues: [],
		requestType
	};
}

function saveHeader(
	name: string,
	value: string,
	lineNumber: number,
	headerMap: Map<string, ParsedHeader[]>
) {
	const normalizedName = name.toLowerCase();
	const header: ParsedHeader = {
		name,
		normalizedName,
		value,
		originalValue: value,
		duplicateCount: 1,
		lineNumber
	};

	if (!headerMap.has(normalizedName)) {
		headerMap.set(normalizedName, []);
	}
	headerMap.get(normalizedName)!.push(header);
}

