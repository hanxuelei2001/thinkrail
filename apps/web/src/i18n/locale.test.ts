import { afterEach, expect, test } from "bun:test";
import { STORAGE_PREFIX } from "../constants/branding";
import {
	getLocale,
	getLocalePreference,
	initializeI18n,
	resolveLocalePreference,
	setLocalePreference,
	subscribeLocale,
} from "./locale";

const originalStablePreferences = Reflect.get(globalThis, "__THINKRAIL_STABLE_PREFERENCES__");

afterEach(() => {
	setLocalePreference("en");
	if (originalStablePreferences === undefined) {
		Reflect.deleteProperty(globalThis, "__THINKRAIL_STABLE_PREFERENCES__");
	} else {
		Reflect.set(globalThis, "__THINKRAIL_STABLE_PREFERENCES__", originalStablePreferences);
	}
});

function installStorage(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	Reflect.set(globalThis, "__THINKRAIL_STABLE_PREFERENCES__", {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
		removeItem: (key: string) => values.delete(key),
	});
	return values;
}

test("system locale resolves any Chinese browser language to Simplified Chinese", () => {
	expect(resolveLocalePreference("system", ["zh-Hans-CN", "en-US"])).toBe("zh-CN");
	expect(resolveLocalePreference("system", ["zh-TW"])).toBe("zh-CN");
	expect(resolveLocalePreference("system", ["en-US"])).toBe("en");
	expect(resolveLocalePreference("system", [])).toBe("en");
	expect(resolveLocalePreference("en", ["zh-CN"])).toBe("en");
	expect(resolveLocalePreference("zh-CN", ["en-US"])).toBe("zh-CN");
});

test("the locale preference is read from and written to the stable adapter", () => {
	const values = installStorage({ [`${STORAGE_PREFIX}locale`]: "zh-CN" });
	try {
		expect(initializeI18n()).toBe("zh-CN");
		expect(getLocalePreference()).toBe("zh-CN");
		setLocalePreference("en");
		expect(getLocale()).toBe("en");
		expect(values.get(`${STORAGE_PREFIX}locale`)).toBe("en");
	} finally {
		Reflect.set(globalThis, "__THINKRAIL_STABLE_PREFERENCES__", originalStablePreferences);
	}
});

test("an invalid or absent preference falls back to system", () => {
	const values = installStorage({ [`${STORAGE_PREFIX}locale`]: "fr-FR" });
	try {
		expect(initializeI18n()).toBe("en");
		expect(getLocalePreference()).toBe("system");
		setLocalePreference("system");
		expect(values.get(`${STORAGE_PREFIX}locale`)).toBe("system");
	} finally {
		Reflect.set(globalThis, "__THINKRAIL_STABLE_PREFERENCES__", originalStablePreferences);
	}
});

test("subscribers are notified when the resolved locale changes", () => {
	installStorage();
	let calls = 0;
	try {
		initializeI18n();
		const unsubscribe = subscribeLocale(() => {
			calls += 1;
		});
		setLocalePreference("zh-CN");
		expect(calls).toBe(1);
		setLocalePreference("zh-CN");
		expect(calls).toBe(1);
		unsubscribe();
	} finally {
		Reflect.set(globalThis, "__THINKRAIL_STABLE_PREFERENCES__", originalStablePreferences);
	}
});
