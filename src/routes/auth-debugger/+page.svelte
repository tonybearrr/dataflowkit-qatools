<script lang="ts">
	import { redirect } from '@sveltejs/kit';
	import { page } from '$app/stores';

	$effect(() => {
		const lang = $page.params.lang || 'en';
		redirect(302, `/${lang}/auth-debugger`);
	});
</script>

