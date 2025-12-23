<script lang="ts">
	import { onMount } from 'svelte';
	import { AlertTriangle, X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm?: () => void;
		onCancel?: () => void;
	}

	let { open, title, message, confirmLabel = 'Continue', cancelLabel = 'Cancel', onConfirm, onCancel }: Props = $props();

	let dialogRef: HTMLDialogElement;

	onMount(() => {
		if (open && dialogRef) {
			dialogRef.showModal();
		}
	});

	$effect(() => {
		if (open && dialogRef) {
			dialogRef.showModal();
		} else if (!open && dialogRef) {
			dialogRef.close();
		}
	});

	function handleConfirm() {
		onConfirm?.();
	}

	function handleCancel() {
		onCancel?.();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogRef) {
			handleCancel();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		} else if (e.key === 'Enter' && e.target === dialogRef) {
			handleConfirm();
		}
	}
</script>

<dialog
	bind:this={dialogRef}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	class="backdrop:bg-black/50 backdrop:backdrop-blur-sm p-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl max-w-md w-full mx-4 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
>
	<div class="p-6">
		<div class="flex items-start gap-4 mb-4">
			<div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
				<AlertTriangle class="w-5 h-5 text-amber-500" />
			</div>
			<div class="flex-1">
				<h3 class="text-lg font-semibold mb-2">{title}</h3>
				<p class="text-sm text-[var(--color-text-muted)]">{message}</p>
			</div>
		</div>

		<div class="flex gap-3 justify-end">
			<button
				onclick={handleCancel}
				class="px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-sm font-medium transition-colors"
			>
				{cancelLabel}
			</button>
			<button
				onclick={handleConfirm}
				class="px-4 py-2 rounded bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors"
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</dialog>
