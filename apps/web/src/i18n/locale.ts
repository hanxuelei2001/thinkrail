import {
	asStablePreferenceAdapter,
	getStablePreferenceAdapter,
	type StablePreferenceAdapter,
} from "../clientPreferences";
import { STORAGE_PREFIX } from "../constants/branding";
import type { LocalePreference, ResolvedLocale } from "./types";

const LOCALE_KEY = `${STORAGE_PREFIX}locale`;
const DEFAULT_PREFERENCE: LocalePreference = "system";

export interface LocaleState {
	readonly preference: LocalePreference;
	readonly locale: ResolvedLocale;
}

let state: LocaleState = { preference: DEFAULT_PREFERENCE, locale: "en" };
const listeners = new Set<() => void>();

export function isLocalePreference(value: unknown): value is LocalePreference {
	return value === "system" || value === "en" || value === "zh-CN";
}

export function resolveLocalePreference(
	preference: LocalePreference,
	languages: readonly string[] = readLanguages(),
): ResolvedLocale {
	if (preference !== "system") return preference;
	return languages.some((language) => language.toLowerCase().startsWith("zh")) ? "zh-CN" : "en";
}

export function getLocaleState(): LocaleState {
	return state;
}

export function getLocale(): ResolvedLocale {
	return state.locale;
}

export function getLocalePreference(): LocalePreference {
	return state.preference;
}

export function subscribeLocale(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function initializeI18n(): ResolvedLocale {
	const preference = readLocalePreference();
	state = { preference, locale: resolveLocalePreference(preference) };
	applyDocumentLang();
	return state.locale;
}

export function setLocalePreference(preference: LocalePreference): ResolvedLocale {
	writeLocalePreference(preference);
	const locale = resolveLocalePreference(preference);
	if (preference === state.preference && locale === state.locale) return locale;
	state = { preference, locale };
	applyDocumentLang();
	for (const listener of listeners) listener();
	return locale;
}

export function readLocalePreference(): LocalePreference {
	try {
		const value = localeStorage()?.getItem(LOCALE_KEY);
		return isLocalePreference(value) ? value : DEFAULT_PREFERENCE;
	} catch {
		return DEFAULT_PREFERENCE;
	}
}

function writeLocalePreference(preference: LocalePreference): void {
	try {
		localeStorage()?.setItem(LOCALE_KEY, preference);
	} catch {
		return;
	}
}

function localeStorage(): StablePreferenceAdapter | null {
	const stable = getStablePreferenceAdapter();
	if (stable) return stable;
	try {
		return asStablePreferenceAdapter(Reflect.get(globalThis, "localStorage"));
	} catch {
		return null;
	}
}

function readLanguages(): readonly string[] {
	if (typeof navigator === "undefined") return [];
	const languages = navigator.languages;
	if (Array.isArray(languages) && languages.length > 0) return languages;
	return navigator.language ? [navigator.language] : [];
}

function applyDocumentLang(): void {
	if (typeof document !== "undefined") document.documentElement.lang = state.locale;
}
