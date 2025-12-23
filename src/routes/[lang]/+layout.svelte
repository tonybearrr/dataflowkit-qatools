<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { setLocale, type Locale } from '$lib/i18n';

	let { children } = $props();

	const lang = $derived(($page.params.lang || 'en') as Locale);
	
	$effect(() => {
		if (browser && lang) {
			setLocale(lang);
		}
	});
</script>

{@render children()}
