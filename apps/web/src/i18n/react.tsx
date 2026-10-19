import { useCallback, useSyncExternalStore } from "react";
import { getLocale, getLocalePreference, subscribeLocale } from "./locale";
import { type TFunction, translate } from "./translate";
import type { LocalePreference, ResolvedLocale } from "./types";

const localeSnapshot = () => getLocale();
const preferenceSnapshot = () => getLocalePreference();

export function useLocale(): ResolvedLocale {
	return useSyncExternalStore(subscribeLocale, localeSnapshot, localeSnapshot);
}

export function useLocalePreference(): LocalePreference {
	return useSyncExternalStore(subscribeLocale, preferenceSnapshot, preferenceSnapshot);
}

export function useT(): TFunction {
	const locale = useLocale();
	return useCallback<TFunction>((key, params) => translate(locale, key, params), [locale]);
}
