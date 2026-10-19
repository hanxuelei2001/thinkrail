export type ResolvedLocale = "en" | "zh-CN";

export type LocalePreference = "system" | ResolvedLocale;

export type MessageParams = Readonly<Record<string, string | number>>;

export interface PluralMessage {
	readonly one: string;
	readonly other: string;
}

export type Message = string | PluralMessage;

export type Catalog = Record<string, Message>;
