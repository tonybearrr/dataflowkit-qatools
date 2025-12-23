import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Locale } from './types';

const STORAGE_KEY = 'qa-toolbox-locale';

const supportedLocales: Locale[] = ['en', 'uk', 'ru'];
const defaultLocale: Locale = 'en';

function getInitialLocale(): Locale {
	if (!browser) return defaultLocale;

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored && supportedLocales.includes(stored as Locale)) {
		return stored as Locale;
	}

	const browserLang = navigator.language.split('-')[0];
	if (browserLang === 'uk') return 'uk';
	if (browserLang === 'ru') return 'ru';
	return defaultLocale;
}

export const locale = writable<Locale>(getInitialLocale());

locale.subscribe((value) => {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, value);
	}
});

export function setLocale(newLocale: Locale) {
	if (supportedLocales.includes(newLocale)) {
		locale.set(newLocale);
	}
}
