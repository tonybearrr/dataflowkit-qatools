import { get } from 'svelte/store';
import { locale } from './store';
import type { Translations, Locale } from './types';
import en from './locales/en.json';
import uk from './locales/uk.json';
import ru from './locales/ru.json';

const translations: Record<Locale, Translations> = {
	en,
	uk,
	ru
};

function getTranslation(key: string, currentLocale: Locale): string | string[] {
	const keys = key.split('.');
	let value: any = translations[currentLocale];

	for (const k of keys) {
		value = value?.[k];
		if (value === undefined) {
			const fallbackValue: any = translations.en;
			for (const fk of keys) {
				value = fallbackValue?.[fk];
				if (value === undefined) return key;
			}
			return value;
		}
	}

	return value;
}

export function t(key: string): string | string[] {
	const currentLocale = get(locale);
	return getTranslation(key, currentLocale);
}

export function tString(key: string): string {
	const result = t(key);
	return typeof result === 'string' ? result : key;
}

export function tReactive(key: string, currentLocale: Locale): string | string[] {
	return getTranslation(key, currentLocale);
}

export function tStringReactive(key: string, currentLocale: Locale): string {
	const result = tReactive(key, currentLocale);
	return typeof result === 'string' ? result : key;
}

export function getLocale(): Locale {
	return get(locale);
}

export function getPath(path: string, currentLang: Locale | string): string {
	const lang = typeof currentLang === 'string' ? (currentLang as Locale) : currentLang;
	return `/${lang}${path}`;
}

export { locale, setLocale } from './store';
export type { Locale, Translations } from './types';
