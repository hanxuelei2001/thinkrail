import { getLocale } from "./locale";

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
	return new Intl.NumberFormat(getLocale(), options).format(value);
}

export function formatDateTime(value: number | Date, options?: Intl.DateTimeFormatOptions): string {
	return new Intl.DateTimeFormat(getLocale(), options).format(value);
}

export function formatRelativeTime(value: number, now: number = Date.now()): string {
	const difference = value - now;
	const absolute = Math.abs(difference);
	const [unit, divisor] =
		absolute < 60_000
			? (["second", 1000] as const)
			: absolute < 3_600_000
				? (["minute", 60_000] as const)
				: absolute < 86_400_000
					? (["hour", 3_600_000] as const)
					: (["day", 86_400_000] as const);
	return new Intl.RelativeTimeFormat(getLocale(), {
		numeric: "auto",
		style: "short",
	}).format(Math.round(difference / divisor), unit);
}
