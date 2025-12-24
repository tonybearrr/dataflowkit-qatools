<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import {
		validatePayload,
		formatJson,
		presets,
		getPreset,
		loadState,
		saveState,
		clearState,
		type ValidationResult
	} from '$lib/qatools/api-validator';
	import { CircleCheckBig, CircleX, AlertTriangle, Copy, Download, RefreshCw, Play, Loader2 } from 'lucide-svelte';

	const lang = $derived(($page.params.lang || 'en') as Locale);

	let payloadText = $state('');
	let schemaText = $state('');
	let autoValidate = $state(false);
	let validationResult = $state<ValidationResult | null>(null);
	let isValidating = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let selectedPresetId = $state<string>('');
	let copied = $state(false);
	
	let payloadTextareaEl: HTMLTextAreaElement | null = $state(null);
	let payloadLineNumbersEl: HTMLDivElement | null = $state(null);
	let schemaTextareaEl: HTMLTextAreaElement | null = $state(null);
	let schemaLineNumbersEl: HTMLDivElement | null = $state(null);
	
	const payloadLineCount = $derived(payloadText ? payloadText.split('\n').length : 1);
	const payloadLineNumbers = $derived(Array.from({ length: payloadLineCount }, (_, i) => i + 1));
	
	const schemaLineCount = $derived(schemaText ? schemaText.split('\n').length : 1);
	const schemaLineNumbers = $derived(Array.from({ length: schemaLineCount }, (_, i) => i + 1));
	
	function handlePayloadScroll() {
		if (payloadLineNumbersEl && payloadTextareaEl) {
			const inner = payloadLineNumbersEl.querySelector('.line-numbers-inner') as HTMLElement;
			if (inner) {
				inner.style.transform = `translateY(-${payloadTextareaEl.scrollTop}px)`;
			}
		}
	}
	
	function handleSchemaScroll() {
		if (schemaLineNumbersEl && schemaTextareaEl) {
			const inner = schemaLineNumbersEl.querySelector('.line-numbers-inner') as HTMLElement;
			if (inner) {
				inner.style.transform = `translateY(-${schemaTextareaEl.scrollTop}px)`;
			}
		}
	}

	onMount(() => {
		const saved = loadState();
		if (saved) {
			payloadText = saved.payload || '';
			schemaText = saved.schema || '';
			autoValidate = saved.autoValidate || false;
			selectedPresetId = saved.lastPreset || '';
		} else {
			payloadText = '{\n  \n}';
			schemaText = '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "type": "object",\n  "properties": {},\n  "required": []\n}';
		}
	});

	function validate() {
		if (isValidating) return;
		
		isValidating = true;
		setTimeout(() => {
			validationResult = validatePayload(payloadText, schemaText);
			saveState({
				payload: payloadText,
				schema: schemaText,
				autoValidate,
				lastPreset: selectedPresetId
			});
			isValidating = false;
		}, 0);
	}

	function handleAutoValidate() {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (!autoValidate) return;

		debounceTimer = setTimeout(() => {
			validate();
		}, 400);
	}

	$effect(() => {
		if (autoValidate) {
			handleAutoValidate();
		}
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	function formatPayload() {
		const formatted = formatJson(payloadText);
		if (formatted !== null) {
			payloadText = formatted;
			if (autoValidate) validate();
		}
	}

	function formatSchema() {
		const formatted = formatJson(schemaText);
		if (formatted !== null) {
			schemaText = formatted;
			if (autoValidate) validate();
		}
	}

	function loadPreset(presetId: string) {
		if (!presetId) {
			payloadText = '{\n  \n}';
			schemaText = '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "type": "object",\n  "properties": {},\n  "required": []\n}';
			selectedPresetId = '';
			validationResult = null;
			if (autoValidate) validate();
			return;
		}
		
		const preset = getPreset(presetId);
		if (preset) {
			payloadText = preset.payload;
			schemaText = preset.schema;
			selectedPresetId = presetId;
			if (autoValidate) validate();
		}
	}

	function reset() {
		if (selectedPresetId) {
			loadPreset(selectedPresetId);
		} else {
			payloadText = '{\n  \n}';
			schemaText = '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "type": "object",\n  "properties": {},\n  "required": []\n}';
			selectedPresetId = '';
			clearState();
		}
		validationResult = null;
	}

	async function copyResult() {
		if (!validationResult || !validationResult.valid) return;
		
		const formatted = formatJson(payloadText);
		if (formatted) {
			try {
				await navigator.clipboard.writeText(formatted);
				copied = true;
				setTimeout(() => (copied = false), 2000);
			} catch {
				// Ignore
			}
		}
	}

	function copyError(issue: any) {
		const text = `${issue.path}: ${issue.message}`;
		navigator.clipboard.writeText(text).catch(() => {});
	}
</script>

<svelte:head>
	<title>{tStringReactive('apiResponseValidator.title', $locale)}</title>
	<meta name="description" content={tStringReactive('apiResponseValidator.description', $locale)} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
	<header class="mb-6 sm:mb-8">
		<div class="flex gap-3 mb-4">
			<div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
				<CircleCheckBig class="w-6 h-6 text-emerald-400" />
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold mb-3">{tStringReactive('apiResponseValidator.heading', $locale)}</h1>
				<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-[60rem]">
					{tStringReactive('apiResponseValidator.subtitle', $locale)}
				</p>
			</div>
		</div>
	</header>

	<div class="grid lg:grid-cols-2 gap-6">
		<!-- Left Column: Inputs -->
		<div class="space-y-4">
			<!-- Payload Editor -->
			<div>
				<label for="payload" class="block text-sm font-semibold mb-2">
					{tStringReactive('apiResponseValidator.payloadLabel', $locale)}
				</label>
				<div class="relative flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] h-80">
					<div
						bind:this={payloadLineNumbersEl}
						class="flex-shrink-0 w-10 py-2 bg-[var(--color-bg-tertiary)] border-r border-[var(--color-border)] overflow-hidden select-none pointer-events-none"
					>
						<div class="line-numbers-inner">
							{#each payloadLineNumbers as num (num)}
								<div class="h-5 px-2 text-right text-xs font-mono leading-5 text-[var(--color-text-muted)]/50">
									{num}
								</div>
							{/each}
						</div>
					</div>
					<textarea
						id="payload"
						bind:this={payloadTextareaEl}
						bind:value={payloadText}
						oninput={() => {
							if (autoValidate) handleAutoValidate();
						}}
						onscroll={handlePayloadScroll}
						class="flex-1 w-full py-2 px-3 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50 leading-5 overflow-y-auto"
						spellcheck="false"
					></textarea>
				</div>
			</div>

			<!-- Schema Editor -->
			<div>
				<label for="schema" class="block text-sm font-semibold mb-2">
					{tStringReactive('apiResponseValidator.schemaLabel', $locale)}
				</label>
				<div class="relative flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] h-80">
					<div
						bind:this={schemaLineNumbersEl}
						class="flex-shrink-0 w-10 py-2 bg-[var(--color-bg-tertiary)] border-r border-[var(--color-border)] overflow-hidden select-none pointer-events-none"
					>
						<div class="line-numbers-inner">
							{#each schemaLineNumbers as num (num)}
								<div class="h-5 px-2 text-right text-xs font-mono leading-5 text-[var(--color-text-muted)]/50">
									{num}
								</div>
							{/each}
						</div>
					</div>
					<textarea
						id="schema"
						bind:this={schemaTextareaEl}
						bind:value={schemaText}
						oninput={() => {
							if (autoValidate) handleAutoValidate();
						}}
						onscroll={handleSchemaScroll}
						class="flex-1 w-full py-2 px-3 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50 leading-5 overflow-y-auto"
						spellcheck="false"
					></textarea>
				</div>
			</div>

			<!-- Controls -->
			 <!-- Presets -->
			<div class="flex flex-wrap items-center gap-2">
				<button
					onclick={validate}
					disabled={isValidating}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{#if isValidating}
						<Loader2 class="w-4 h-4 animate-spin" />
					{:else}
						<Play class="w-4 h-4" />
					{/if}
					{tStringReactive('apiResponseValidator.validate', $locale)}
				</button>
				<label class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
					<input type="checkbox" bind:checked={autoValidate} class="rounded" />
					{tStringReactive('apiResponseValidator.autoValidate', $locale)}
				</label>

				<button
					onclick={reset}
					class="px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-1"
				>
					<RefreshCw class="w-4 h-4" />
					{tStringReactive('apiResponseValidator.reset', $locale)}
				</button>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<select
					id="preset-select"
					bind:value={selectedPresetId}
					onchange={(e) => loadPreset(e.currentTarget.value)}
					class="w-auto px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				>
					<option value="">{tStringReactive('apiResponseValidator.selectPreset', $locale)}</option>
					{#each presets as preset}
						<option value={preset.id}>{preset.name}</option>
					{/each}
				</select>

				

				<button
					onclick={formatPayload}
					class="px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
				>
					{tStringReactive('apiResponseValidator.formatPayload', $locale)}
				</button>

				<button
					onclick={formatSchema}
					class="px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
				>
					{tStringReactive('apiResponseValidator.formatSchema', $locale)}
				</button>

				
			</div>

			
		</div>

		<!-- Right Column: Results -->
		<div class="space-y-4">
			<label for="payload" class="block text-sm font-semibold mb-2">
				{tStringReactive('apiResponseValidator.outputLabel', $locale)}
			</label>
			<div class="p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] min-h-[200px]">
				
				{#if validationResult}
					{#if validationResult.parseError}
						<div class="flex items-start gap-3">
							<AlertTriangle class="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
							<div class="flex-1">
								<h2 class="text-lg font-semibold text-[var(--color-error)] mb-2">
									{tStringReactive('apiResponseValidator.parseError', $locale)}
								</h2>
								<p class="text-sm text-[var(--color-text-muted)] mb-1">
									{validationResult.parseError.message}
								</p>
								{#if validationResult.parseError.line}
									<p class="text-xs text-[var(--color-text-muted)]">
										{tStringReactive('apiResponseValidator.line', $locale)} {validationResult.parseError.line}
										{#if validationResult.parseError.column}
											, {tStringReactive('apiResponseValidator.column', $locale)} {validationResult.parseError.column}
										{/if}
									</p>
								{/if}
							</div>
						</div>
					{:else if validationResult.schemaParseError}
						<div class="flex items-start gap-3">
							<AlertTriangle class="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
							<div class="flex-1">
								<h2 class="text-lg font-semibold text-[var(--color-error)] mb-2">
									{tStringReactive('apiResponseValidator.schemaParseError', $locale)}
								</h2>
								<p class="text-sm text-[var(--color-text-muted)] mb-1">
									{validationResult.schemaParseError.message}
								</p>
								{#if validationResult.schemaParseError.line}
									<p class="text-xs text-[var(--color-text-muted)]">
										{tStringReactive('apiResponseValidator.line', $locale)} {validationResult.schemaParseError.line}
										{#if validationResult.schemaParseError.column}
											, {tStringReactive('apiResponseValidator.column', $locale)} {validationResult.schemaParseError.column}
										{/if}
									</p>
								{/if}
							</div>
						</div>
					{:else if validationResult.valid}
						<div class="flex items-start gap-3">
							<CircleCheckBig class="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
							<div class="flex-1">
								<h2 class="text-lg font-semibold text-[var(--color-success)] mb-4">
									{tStringReactive('apiResponseValidator.valid', $locale)}
								</h2>
								<div class="mt-4">
									<div class="block text-sm font-semibold mb-2">
										{tStringReactive('apiResponseValidator.formattedOutput', $locale)}
									</div>
									<pre class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-xs font-mono overflow-auto max-h-96">{formatJson(payloadText) || payloadText}</pre>
									<button
										onclick={copyResult}
										class="mt-2 px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-1"
									>
										<Copy class="w-3 h-3" />
										{copied ? tStringReactive('apiResponseValidator.copied', $locale) : tStringReactive('apiResponseValidator.copy', $locale)}
									</button>
								</div>
							</div>
						</div>
					{:else}
						<div class="flex items-start gap-3">
							<CircleX class="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
							<div class="flex-1">
								<h2 class="text-lg font-semibold text-[var(--color-error)] mb-2">
									{tStringReactive('apiResponseValidator.invalid', $locale)}
								</h2>
								<p class="text-sm text-[var(--color-text-muted)] mb-4">
									{validationResult.errors.length} {validationResult.errors.length === 1 ? tStringReactive('apiResponseValidator.error', $locale) : tStringReactive('apiResponseValidator.errors', $locale)}
								</p>
								<div class="space-y-2 max-h-96 overflow-y-auto">
									{#each validationResult.errors as issue}
										<div class="p-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
											<div class="flex items-start justify-between gap-2">
												<div class="flex-1 min-w-0">
													<p class="text-sm font-mono text-[var(--color-accent)] mb-1 break-all">
														{issue.path}
													</p>
													<p class="text-sm text-[var(--color-text)] mb-1">
														{issue.message}
													</p>
													<div class="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
														<span class="px-2 py-0.5 rounded bg-[var(--color-bg-secondary)]">
															{tStringReactive('apiResponseValidator.keyword', $locale)}: {issue.keyword}
														</span>
														{#if issue.expected}
															<span class="px-2 py-0.5 rounded bg-[var(--color-bg-secondary)]">
																{tStringReactive('apiResponseValidator.expected', $locale)}: {issue.expected}
															</span>
														{/if}
														{#if issue.received}
															<span class="px-2 py-0.5 rounded bg-[var(--color-bg-secondary)]">
																{tStringReactive('apiResponseValidator.received', $locale)}: {issue.received}
															</span>
														{/if}
													</div>
												</div>
												<button
													onclick={() => copyError(issue)}
													class="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] transition-colors flex-shrink-0"
													title={tStringReactive('apiResponseValidator.copyError', $locale)}
												>
													<Copy class="w-4 h-4 text-[var(--color-text-muted)]" />
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				{:else}
					<div class="text-center py-8 text-[var(--color-text-muted)]">
						<p class="text-sm">{tStringReactive('apiResponseValidator.noValidation', $locale)}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- About Section -->
	<section class="mt-8 sm:mt-16 prose prose-invert max-w-none">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
			{tStringReactive('apiResponseValidator.whatIs', $locale)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('apiResponseValidator.description', $locale)}
		</p>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
			{tStringReactive('apiResponseValidator.parameters', $locale)}
		</h2>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li><strong>{tStringReactive('apiResponseValidator.payloadLabel', $locale)}</strong> — {tStringReactive('apiResponseValidator.payloadDesc', $locale)}</li>
			<li><strong>{tStringReactive('apiResponseValidator.schemaLabel', $locale)}</strong> — {tStringReactive('apiResponseValidator.schemaDesc', $locale)}</li>
			<li><strong>{tStringReactive('apiResponseValidator.autoValidate', $locale)}</strong> — {tStringReactive('apiResponseValidator.autoValidateDesc', $locale)}</li>
			<li><strong>{tStringReactive('apiResponseValidator.presets', $locale)}</strong> — {tStringReactive('apiResponseValidator.presetsDesc', $locale)}</li>
			<li><strong>{tStringReactive('apiResponseValidator.format', $locale)}</strong> — {tStringReactive('apiResponseValidator.formatDesc', $locale)}</li>
		</ul>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
			{tStringReactive('apiResponseValidator.useCases', $locale)}
		</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-2">
			{tStringReactive('apiResponseValidator.useCasesSubtitle', $locale)}
		</p>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('apiResponseValidator.useCase1', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.useCase2', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.useCase3', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.useCase4', $locale)}</li>
		</ul>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
			{tStringReactive('apiResponseValidator.whyUse', $locale)}
		</h2>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('apiResponseValidator.whyUse1', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.whyUse2', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.whyUse3', $locale)}</li>
		</ul>

		<h2 class="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4">
			{tStringReactive('apiResponseValidator.typicalWorkflow', $locale)}
		</h2>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside mb-4">
			<li>{tStringReactive('apiResponseValidator.workflow1', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.workflow2', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.workflow3', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.workflow4', $locale)}</li>
			<li>{tStringReactive('apiResponseValidator.workflow5', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">
			{tStringReactive('apiResponseValidator.privacy', $locale)}
		</h3>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('apiResponseValidator.privacyText', $locale)}
		</p>
	</section>
</div>
