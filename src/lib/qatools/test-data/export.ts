export function toCSV(rows: Record<string, any>[], includeHeader: boolean = true): string {
	if (rows.length === 0) return '';

	const headers = Object.keys(rows[0]);
	const lines: string[] = [];

	if (includeHeader) {
		lines.push(headers.map(escapeCSV).join(','));
	}

	for (const row of rows) {
		const values = headers.map((header) => {
			const value = row[header];
			if (value === null || value === undefined) {
				return '';
			}
			return escapeCSV(String(value));
		});
		lines.push(values.join(','));
	}

	return lines.join('\n');
}

function escapeCSV(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export function toJSON(rows: Record<string, any>[], arrayKey?: string): string {
	if (arrayKey) {
		return JSON.stringify({ [arrayKey]: rows }, null, 2);
	}
	return JSON.stringify(rows, null, 2);
}

export function downloadFile(filename: string, content: string, mime: string): void {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
