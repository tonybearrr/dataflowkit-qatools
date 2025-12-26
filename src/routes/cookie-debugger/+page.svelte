<script lang="ts">
	import { redirect } from '@sveltejs/kit';
	import { page } from '$app/stores';

	$effect(() => {
		const lang = $page.params.lang || 'en';
		throw redirect(302, `/${lang}/cookie-debugger`);
	});
</script>

