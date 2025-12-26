<script lang="ts">
	import type { ParsedCookie, CookieContext, CookieSendResult } from '../types';
	import { canSendCookie } from '../simulateCookie';
	import { Copy, Check, Lightbulb } from 'lucide-svelte';
	import { copyToClipboard } from '$lib/qatools/headers/utils';

	interface Props {
		cookie: ParsedCookie | null;
		context: CookieContext | null;
		locale: (key: string) => string;
	}

	let { cookie, context, locale }: Props = $props();

	let copiedName = $state(false);
	let copiedValue = $state(false);
	let copiedFull = $state(false);

	async function handleCopyName() {
		if (!cookie) return;
		const success = await copyToClipboard(cookie.name);
		if (success) {
			copiedName = true;
			setTimeout(() => (copiedName = false), 2000);
		}
	}

	async function handleCopyValue() {
		if (!cookie) return;
		const success = await copyToClipboard(cookie.value);
		if (success) {
			copiedValue = true;
			setTimeout(() => (copiedValue = false), 2000);
		}
	}

	async function handleCopyFull() {
		if (!cookie) return;
		const success = await copyToClipboard(cookie.rawLine);
		if (success) {
			copiedFull = true;
			setTimeout(() => (copiedFull = false), 2000);
		}
	}

	const sendResult = $derived(
		cookie && context ? canSendCookie(cookie, context) : null
	);

	function formatDate(date: Date | string): string {
		if (date instanceof Date) {
			return date.toLocaleString();
		}
		return date;
	}
</script>

{#if cookie}
	<div class="sticky top-20">
		<!-- Header -->
		<div class="mb-6">
			<div class="flex items-center gap-3 mb-3">
				<h2 class="text-xl font-bold font-mono">{cookie.name}</h2>
			</div>
			<div class="p-3 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm break-all">
				{cookie.value}
			</div>
		</div>

		<!-- Send Result -->
		{#if sendResult}
			<div class="mb-6 p-3 rounded-lg border {sendResult.ok
				? 'border-green-500/20 bg-green-500/10'
				: 'border-red-500/20 bg-red-500/10'}">
				<p class="text-sm font-semibold mb-2">
					{sendResult.ok ? locale('cookieDebugger.details.willBeSent') : locale('cookieDebugger.details.willNotBeSent')}
				</p>
				{#if sendResult.reasons.length > 0}
					<ul class="list-disc list-inside space-y-1 text-xs text-[var(--color-text-muted)]">
						{#each sendResult.reasons as reason}
							<li>{locale(reason)}</li>
						{/each}
					</ul>
				{/if}
				{#if sendResult.warnings.length > 0}
					<div class="mt-2 pt-2 border-t border-[var(--color-border)]">
						<p class="text-xs font-semibold mb-1">{locale('cookieDebugger.details.warnings')}:</p>
						<ul class="list-disc list-inside space-y-1 text-xs text-[var(--color-text-muted)]">
							{#each sendResult.warnings as warning}
								<li>{locale(warning)}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Attributes -->
		<div class="mb-6">
			<h3 class="text-sm font-semibold mb-2">{locale('cookieDebugger.details.attributes')}</h3>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-[var(--color-text-muted)]">Domain:</span>
					<span class="font-mono">
						{#if cookie.hostOnly}
							{locale('cookieDebugger.details.hostOnly')}
						{:else if cookie.attrs.domain}
							{cookie.attrs.domain}
						{:else}
							-
						{/if}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[var(--color-text-muted)]">Path:</span>
					<span class="font-mono">{cookie.attrs.path || '/'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[var(--color-text-muted)]">Secure:</span>
					<span>{cookie.attrs.secure ? '✓' : '✗'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[var(--color-text-muted)]">HttpOnly:</span>
					<span>{cookie.attrs.httpOnly ? '✓' : '✗'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[var(--color-text-muted)]">SameSite:</span>
					<span>{cookie.attrs.sameSite || locale('cookieDebugger.details.notSet')}</span>
				</div>
				{#if cookie.attrs.maxAge !== undefined}
					<div class="flex justify-between">
						<span class="text-[var(--color-text-muted)]">Max-Age:</span>
						<span class="font-mono">{cookie.attrs.maxAge}s</span>
					</div>
				{/if}
				{#if cookie.attrs.expires}
					<div class="flex justify-between">
						<span class="text-[var(--color-text-muted)]">Expires:</span>
						<span class="font-mono text-xs">{formatDate(cookie.attrs.expires)}</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Quick actions -->
		<div class="border-t border-[var(--color-border)] pt-4">
			<h3 class="text-sm font-semibold mb-3">{locale('cookieDebugger.details.quickActions')}</h3>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					onclick={handleCopyName}
					class="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg)] transition-colors text-sm"
				>
					{#if copiedName}
						<Check class="w-4 h-4 text-green-400" />
					{:else}
						<Copy class="w-4 h-4" />
					{/if}
					{locale('cookieDebugger.details.copyName')}
				</button>
				<button
					type="button"
					onclick={handleCopyValue}
					class="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg)] transition-colors text-sm"
				>
					{#if copiedValue}
						<Check class="w-4 h-4 text-green-400" />
					{:else}
						<Copy class="w-4 h-4" />
					{/if}
					{locale('cookieDebugger.details.copyValue')}
				</button>
				<button
					type="button"
					onclick={handleCopyFull}
					class="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg)] transition-colors text-sm"
				>
					{#if copiedFull}
						<Check class="w-4 h-4 text-green-400" />
					{:else}
						<Copy class="w-4 h-4" />
					{/if}
					{locale('cookieDebugger.details.copyFull')}
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="sticky top-20">
		<p class="text-sm text-[var(--color-text-muted)]">
			{locale('cookieDebugger.details.selectCookie')}
		</p>
	</div>
{/if}

