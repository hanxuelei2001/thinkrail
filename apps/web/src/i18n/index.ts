import { getLocale } from "./locale";
import { type MessageKey, translate } from "./translate";
import type { MessageParams } from "./types";

export {
	formatDateTime,
	formatNumber,
	formatRelativeTime,
} from "./format";
export {
	getLocale,
	getLocalePreference,
	getLocaleState,
	initializeI18n,
	isLocalePreference,
	readLocalePreference,
	resolveLocalePreference,
	setLocalePreference,
	subscribeLocale,
} from "./locale";
export { useLocale, useLocalePreference, useT } from "./react";
export type { MessageKey, TFunction } from "./translate";
export type {
	Catalog,
	LocalePreference,
	Message,
	MessageParams,
	PluralMessage,
	ResolvedLocale,
} from "./types";

export function t(key: MessageKey, params?: MessageParams): string {
	return translate(getLocale(), key, params);
}
