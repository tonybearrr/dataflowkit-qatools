<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const lang = $derived($page.params.lang || 'en');
	goto(`/${lang}/headers-inspector`, { replaceState: true });
</script>

