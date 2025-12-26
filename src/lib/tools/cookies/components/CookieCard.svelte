<script lang="ts">
	import type { ParsedCookie } from '../types';
	import { truncateValue } from '$lib/qatools/headers/utils';

	interface Props {
		cookie: ParsedCookie;
		selected?: boolean;
		onSelect?: (cookie: ParsedCookie) => void;
	}

	let { cookie, selected = false, onSelect }: Props = $props();
</script>

<button
	type="button"
	data-cookie-row={cookie.name}
	onclick={() => onSelect?.(cookie)}
	class="w-full p-3 rounded-lg border transition-all text-left {selected
		? 'border-[var(--color-accent)] bg-[var(--color-bg-tertiary)]'
		: 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)]'}"
>
	<div class="flex items-start gap-3">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<h3 class="font-semibold font-mono text-sm">{cookie.name}</h3>
			</div>
			<p class="text-xs text-[var(--color-text-muted)] truncate mb-2">
				{truncateValue(cookie.value, 40)}
			</p>
			<div class="flex flex-wrap gap-1">
				{#if cookie.attrs.secure}
					<span class="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Secure</span>
				{/if}
				{#if cookie.attrs.httpOnly}
					<span class="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">HttpOnly</span>
				{/if}
				{#if cookie.attrs.sameSite}
					<span class="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
						SameSite={cookie.attrs.sameSite}
					</span>
				{/if}
				{#if cookie.hostOnly}
					<span class="text-xs px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400">Host-only</span>
				{:else if cookie.attrs.domain}
					<span class="text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">
						Domain={cookie.attrs.domain}
					</span>
				{/if}
			</div>
		</div>
	</div>
</button>

