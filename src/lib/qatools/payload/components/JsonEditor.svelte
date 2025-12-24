<script lang="ts">
	import { validateJson, formatJson, checkBracketBalance, getBracketBalanceMessage, type BracketBalance } from '../validate';
	import { TextAlignJustify, CircleCheckBig, CircleX, TriangleAlert } from 'lucide-svelte';

	interface Props {
		value: string;
		onChange?: (value: string) => void;
		onValidJson?: (json: any) => void;
	}

	let { value, onChange, onValidJson }: Props = $props();

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let validation = $state<{ valid: boolean; error?: any }>({ valid: true });
	let bracketBalance = $state<BracketBalance | null>(null);
	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let lineNumbersEl: HTMLDivElement | null = $state(null);

	const lineCount = $derived(value ? value.split('\n').length : 1);
	const lineNumbers = $derived(Array.from({ length: lineCount }, (_, i) => i + 1));

	const bracketMessage = $derived(
		bracketBalance ? getBracketBalanceMessage(bracketBalance) : null
	);

	function getBracketIssueLines(): Set<number> {
		if (!bracketBalance) return new Set<number>();
		const lines = new Set<number>();
		bracketBalance.unclosed.forEach((b) => lines.add(b.line));
		bracketBalance.unexpected.forEach((b) => lines.add(b.line));
		return lines;
	}

	function getLineClass(lineNum: number): string {
		const isErrorLine = validation.error?.line === lineNum;
		const isBracketIssue = getBracketIssueLines().has(lineNum);

		if (isErrorLine) {
			return 'text-[var(--color-error)] bg-[var(--color-error)]/10';
		}
		if (isBracketIssue) {
			return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10';
		}
		return 'text-[var(--color-text-muted)]/50';
	}

	function handleScroll() {
		if (lineNumbersEl && textareaEl) {
			const inner = lineNumbersEl.querySelector('.line-numbers-inner') as HTMLElement;
			if (inner) {
				inner.style.transform = `translateY(-${textareaEl.scrollTop}px)`;
			}
		}
	}

	function handleInput(e: Event) {
		const newValue = (e.target as HTMLTextAreaElement).value;
		onChange?.(newValue);

		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const result = validateJson(newValue);
			validation = result;
			if (result.valid && result.json) {
				onValidJson?.(result.json);
				bracketBalance = null;
			} else {
				bracketBalance = checkBracketBalance(newValue);
			}
		}, 300);
	}

	function handleFormat() {
		const result = validateJson(value);
		if (result.valid && result.json) {
			const formatted = formatJson(result.json, false);
			onChange?.(formatted);
			onValidJson?.(result.json);
			validation = { valid: true };
		}
	}

	function handleMinify() {
		const result = validateJson(value);
		if (result.valid && result.json) {
			const minified = formatJson(result.json, true);
			onChange?.(minified);
			onValidJson?.(result.json);
			validation = { valid: true };
		}
	}
</script>

<div class="flex flex-col h-full">
	<div class="flex items-center justify-between mb-2">
		<div class="flex items-center gap-2">
			{#if validation.valid}
				<CircleCheckBig class="w-4 h-4 text-[var(--color-success)]" />
				<span class="text-xs text-[var(--color-success)]">Valid JSON</span>
			{:else}
				<CircleX class="w-4 h-4 text-[var(--color-error)]" />
				<span class="text-xs text-[var(--color-error)]">
					{validation.error?.message || 'Invalid JSON'}
					{#if validation.error?.line}
						(Line {validation.error.line}, Col {validation.error.column})
					{/if}
				</span>
			{/if}
		</div>
		<div class="flex gap-2">
			<button
				onclick={handleFormat}
				class="px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] flex items-center gap-1"
			>
				<TextAlignJustify class="w-3 h-3" />
				Format
			</button>
			<button
				onclick={handleMinify}
				class="px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
			>
				Minify
			</button>
		</div>
	</div>
	<div class="relative flex rounded-lg border {validation.valid ? 'border-[var(--color-border)]' : 'border-[var(--color-error)]'} bg-[var(--color-bg-tertiary)] flex-1 overflow-hidden">
		<div
			bind:this={lineNumbersEl}
			class="flex-shrink-0 w-10 py-2 bg-[var(--color-bg-tertiary)] border-r border-[var(--color-border)] overflow-hidden select-none pointer-events-none"
		>
			<div class="line-numbers-inner">
				{#each lineNumbers as num (num)}
					<div
						class="h-5 px-2 text-right text-xs font-mono leading-5 {getLineClass(num)}"
					>
						{num}
					</div>
				{/each}
			</div>
		</div>
		<textarea
			bind:this={textareaEl}
			value={value}
			oninput={handleInput}
			onscroll={handleScroll}
			class="flex-1 w-full py-2 px-3 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50 leading-5 overflow-y-auto"
			placeholder="Enter JSON here..."
			spellcheck="false"
		></textarea>
	</div>
	{#if bracketMessage}
		<div class="mt-2 p-2 rounded bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 flex-shrink-0 max-h-20 overflow-y-auto">
			<div class="flex items-start gap-2">
				<TriangleAlert class="w-4 h-4 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
				<div class="flex-1 min-w-0">
					<p class="text-xs text-[var(--color-warning)] font-medium mb-1">Bracket Balance Warning</p>
					<p class="text-xs text-[var(--color-text-muted)]">{bracketMessage}</p>
					{#if bracketBalance && bracketBalance.unclosed.length > 0}
						<div class="mt-2 flex flex-wrap gap-1">
							{#each bracketBalance.unclosed as bracket (bracket.position)}
								<button
									type="button"
									onclick={() => {
										if (textareaEl) {
											textareaEl.focus();
											textareaEl.setSelectionRange(bracket.position, bracket.position + 1);
										}
									}}
									class="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20 transition-colors"
								>
									{bracket.char} line {bracket.line}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
