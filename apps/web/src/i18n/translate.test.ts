import { expect, test } from "bun:test";
import { translate } from "./translate";

test("translate returns the requested locale's message", () => {
	expect(translate("en", "common.cancel")).toBe("Cancel");
	expect(translate("zh-CN", "common.cancel")).toBe("取消");
});

test("translate interpolates named parameters without touching unknown placeholders", () => {
	expect(translate("en", "settings.language.trigger", { language: "English" })).toBe(
		"Display language: English",
	);
	expect(translate("zh-CN", "settings.language.trigger", { language: "简体中文" })).toBe(
		"显示语言：简体中文",
	);
	expect(translate("en", "settings.language.trigger", {})).toBe("Display language: {language}");
});

test("translate selects the English plural form and keeps Chinese uninflected", () => {
	expect(translate("en", "common.items", { count: 1 })).toBe("1 item");
	expect(translate("en", "common.items", { count: 3 })).toBe("3 items");
	expect(translate("zh-CN", "common.items", { count: 1 })).toBe("1 项");
	expect(translate("zh-CN", "common.items", { count: 3 })).toBe("3 项");
});
