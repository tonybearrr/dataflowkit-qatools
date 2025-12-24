export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		// Fallback for older browsers
		try {
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.opacity = '0';
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			return true;
		} catch {
			return false;
		}
	}
}

export function getCategoryColor(category: string): string {
	switch (category) {
		case '1xx':
			return 'text-blue-400';
		case '2xx':
			return 'text-green-400';
		case '3xx':
			return 'text-yellow-400';
		case '4xx':
			return 'text-orange-400';
		case '5xx':
			return 'text-red-400';
		default:
			return 'text-[var(--color-text-muted)]';
	}
}

export function getCategoryBgColor(category: string): string {
	switch (category) {
		case '1xx':
			return 'bg-blue-500/10';
		case '2xx':
			return 'bg-green-500/10';
		case '3xx':
			return 'bg-yellow-500/10';
		case '4xx':
			return 'bg-orange-500/10';
		case '5xx':
			return 'bg-red-500/10';
		default:
			return 'bg-[var(--color-bg-tertiary)]';
	}
}

