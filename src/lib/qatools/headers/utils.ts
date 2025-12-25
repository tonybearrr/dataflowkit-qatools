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
		case 'authentication':
			return 'text-blue-400';
		case 'content':
			return 'text-purple-400';
		case 'caching':
			return 'text-yellow-400';
		case 'cors':
			return 'text-cyan-400';
		case 'cookies':
			return 'text-orange-400';
		case 'security':
			return 'text-red-400';
		case 'redirection':
			return 'text-green-400';
		case 'forwarding':
			return 'text-indigo-400';
		default:
			return 'text-[var(--color-text-muted)]';
	}
}

export function getCategoryBgColor(category: string): string {
	switch (category) {
		case 'authentication':
			return 'bg-blue-500/10';
		case 'content':
			return 'bg-purple-500/10';
		case 'caching':
			return 'bg-yellow-500/10';
		case 'cors':
			return 'bg-cyan-500/10';
		case 'cookies':
			return 'bg-orange-500/10';
		case 'security':
			return 'bg-red-500/10';
		case 'redirection':
			return 'bg-green-500/10';
		case 'forwarding':
			return 'bg-indigo-500/10';
		default:
			return 'bg-[var(--color-bg-tertiary)]';
	}
}

export function getSeverityColor(severity: 'error' | 'warning' | 'info'): string {
	switch (severity) {
		case 'error':
			return 'text-red-400 bg-red-500/10 border-red-500/20';
		case 'warning':
			return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
		case 'info':
			return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
		default:
			return 'text-[var(--color-text-muted)]';
	}
}

export function truncateValue(value: string, maxLength: number = 60): string {
	if (value.length <= maxLength) return value;
	return value.slice(0, maxLength) + '...';
}

