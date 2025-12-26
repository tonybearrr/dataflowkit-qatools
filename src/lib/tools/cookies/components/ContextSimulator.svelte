<script lang="ts">
	import type { CookieContext } from '../types';
	import { deriveContextFromUrls } from '../simulateCookie';
	import { Info } from 'lucide-svelte';

	interface Props {
		context: CookieContext | null;
		onContextChange: (context: CookieContext) => void;
		locale: (key: string) => string;
	}

	let { context, onContextChange, locale }: Props = $props();

	let siteUrl = $state(context?.siteUrl || 'https://app.example.com');
	let requestUrl = $state(context?.requestUrl || 'https://api.example.com/v1/me');
	let method = $state<CookieContext['method']>(context?.method || 'GET');
	let isTopLevelNavigation = $state(context?.isTopLevelNavigation || false);
	let isIframe = $state(context?.isIframe || false);

	$effect(() => {
		const newContext = deriveContextFromUrls(siteUrl, requestUrl, method, isTopLevelNavigation, isIframe);
		if (newContext) {
			onContextChange(newContext);
		}
	});

	function updateContext() {
		const newContext = deriveContextFromUrls(siteUrl, requestUrl, method, isTopLevelNavigation, isIframe);
		if (newContext) {
			onContextChange(newContext);
		}
	}
</script>

<div class="mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
	<h3 class="text-sm font-semibold mb-4">{locale('cookieDebugger.context.title')}</h3>

	<div class="space-y-4">
		<div>
			<label class="block text-xs font-medium mb-1 text-[var(--color-text-muted)]">
				{locale('cookieDebugger.context.siteUrl')}
			</label>
			<input
				type="text"
				bind:value={siteUrl}
				oninput={updateContext}
				class="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] font-mono text-sm"
				placeholder="https://app.example.com"
			/>
		</div>

		<div>
			<label class="block text-xs font-medium mb-1 text-[var(--color-text-muted)]">
				{locale('cookieDebugger.context.requestUrl')}
			</label>
			<input
				type="text"
				bind:value={requestUrl}
				oninput={updateContext}
				class="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] font-mono text-sm"
				placeholder="https://api.example.com/v1/me"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label class="block text-xs font-medium mb-1 text-[var(--color-text-muted)]">
					{locale('cookieDebugger.context.method')}
				</label>
				<select
					bind:value={method}
					onchange={updateContext}
					class="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
				>
					<option value="GET">GET</option>
					<option value="POST">POST</option>
					<option value="PUT">PUT</option>
					<option value="DELETE">DELETE</option>
					<option value="PATCH">PATCH</option>
					<option value="HEAD">HEAD</option>
					<option value="OPTIONS">OPTIONS</option>
				</select>
			</div>

			<div>
				<label class="block text-xs font-medium mb-1 text-[var(--color-text-muted)]">
					{locale('cookieDebugger.context.isHttps')}
				</label>
				<div class="px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm">
					{context?.isHttps ? '✓' : '✗'}
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={isTopLevelNavigation}
					onchange={updateContext}
					class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
				/>
				<span class="text-sm text-[var(--color-text-muted)]">
					{locale('cookieDebugger.context.isTopLevelNavigation')}
				</span>
			</label>

			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={isIframe}
					onchange={updateContext}
					class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
				/>
				<span class="text-sm text-[var(--color-text-muted)]">
					{locale('cookieDebugger.context.isIframe')}
				</span>
			</label>
		</div>

		{#if context}
			<div class="pt-3 border-t border-[var(--color-border)]">
				<div class="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
					<Info class="w-4 h-4 mt-0.5 flex-shrink-0" />
					<div>
						<p class="mb-1">
							{locale('cookieDebugger.context.isCrossSite')}: <strong>{context.isCrossSite ? locale('cookieDebugger.context.yes') : locale('cookieDebugger.context.no')}</strong>
						</p>
						<p class="text-xs opacity-80">
							{locale('cookieDebugger.context.sameSiteNote')}
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

