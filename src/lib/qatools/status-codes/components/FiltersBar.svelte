<script lang="ts">
	import { Search } from 'lucide-svelte';

	interface Props {
		searchQuery: string;
		category: string;
		commonOnly: boolean;
		onSearchChange: (query: string) => void;
		onCategoryChange: (category: string) => void;
		onCommonOnlyChange: (commonOnly: boolean) => void;
		locale: (key: string) => string;
	}

	let {
		searchQuery,
		category,
		commonOnly,
		onSearchChange,
		onCategoryChange,
		onCommonOnlyChange,
		locale
	}: Props = $props();
</script>

<div class="space-y-4">
	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
		<input
			type="text"
			bind:value={searchQuery}
			oninput={(e) => onSearchChange(e.currentTarget.value)}
			placeholder={locale('statusCodeReference.searchPlaceholder')}
			class="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
		/>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3">
		<!-- Category filter -->
		<select
			bind:value={category}
			onchange={(e) => onCategoryChange(e.currentTarget.value)}
			class="px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
		>
			<option value="all">{locale('statusCodeReference.categoryAll')}</option>
			<option value="1xx">{locale('statusCodeReference.category1xx')}</option>
			<option value="2xx">{locale('statusCodeReference.category2xx')}</option>
			<option value="3xx">{locale('statusCodeReference.category3xx')}</option>
			<option value="4xx">{locale('statusCodeReference.category4xx')}</option>
			<option value="5xx">{locale('statusCodeReference.category5xx')}</option>
		</select>

		<!-- Common only toggle -->
		<label class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
			<input
				type="checkbox"
				bind:checked={commonOnly}
				onchange={(e) => onCommonOnlyChange(e.currentTarget.checked)}
				class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
			/>
			<span>{locale('statusCodeReference.commonOnly')}</span>
		</label>
	</div>
</div>

