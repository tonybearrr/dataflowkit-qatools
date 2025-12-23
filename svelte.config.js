import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: '',
			assets: '',
			relative: false
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			entries: [
				'*',
				'/en',
				'/uk',
				'/ru',
				'/en/privacy',
				'/uk/privacy',
				'/ru/privacy',
				'/en/test-data',
				'/uk/test-data',
				'/ru/test-data',
				'/en/api-response-validator',
				'/uk/api-response-validator',
				'/ru/api-response-validator',
				'/en/status-code-reference',
				'/uk/status-code-reference',
				'/ru/status-code-reference',
				'/en/user-agent-parser',
				'/uk/user-agent-parser',
				'/ru/user-agent-parser',
				'/en/cookie-inspector',
				'/uk/cookie-inspector',
				'/ru/cookie-inspector',
				'/en/header-inspector',
				'/uk/header-inspector',
				'/ru/header-inspector',
				'/en/test-case-builder',
				'/uk/test-case-builder',
				'/ru/test-case-builder'
			]
		}
	}
};

export default config;
