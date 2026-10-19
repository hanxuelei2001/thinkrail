import { en, type MessageKey } from "./messages/en";
import { zhCN } from "./messages/zh-CN";
import type { Message, MessageParams, ResolvedLocale } from "./types";

const catalogs: Record<ResolvedLocale, Record<MessageKey, Message>> = {
	en,
	"zh-CN": zhCN,
};

export type { MessageKey };

export type TFunction = (key: MessageKey, params?: MessageParams) => string;

export function translate(
	locale: ResolvedLocale,
	key: MessageKey,
	params: MessageParams = {},
): string {
	const message = catalogs[locale][key] ?? en[key];
	if (message === undefined) return key;
	const template =
		typeof message === "string" ? message : selectPlural(locale, message, params.count);
	return interpolate(template, params);
}

function selectPlural(
	locale: ResolvedLocale,
	message: { readonly one: string; readonly other: string },
	count: string | number | undefined,
): string {
	const numericCount = typeof count === "number" ? count : 0;
	const category = new Intl.PluralRules(locale).select(numericCount);
	return category === "one" ? message.one : message.other;
}

function interpolate(template: string, params: MessageParams): string {
	return template.replace(/\{(\w+)\}/g, (match, name: string) => {
		const value = params[name];
		return value === undefined ? match : String(value);
	});
}
