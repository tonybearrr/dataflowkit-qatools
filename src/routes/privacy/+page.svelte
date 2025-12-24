<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getLocale } from '$lib/i18n';

	onMount(() => {
		if (browser) {
			const lang = getLocale();
			goto(`/${lang}/privacy`, { replaceState: true });
		}
	});
</script>
