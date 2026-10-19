import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { setLocalePreference } from "@/i18n";
import { LanguageSettings } from "./LanguageSettings";

test("the language page follows the active locale", () => {
	try {
		setLocalePreference("en");
		const english = renderToStaticMarkup(<LanguageSettings />);
		expect(english).toContain("Display language");
		expect(english).toContain("Applies to this device only.");

		setLocalePreference("zh-CN");
		const chinese = renderToStaticMarkup(<LanguageSettings />);
		expect(chinese).toContain("显示语言");
		expect(chinese).toContain("仅应用于当前设备");
	} finally {
		setLocalePreference("en");
	}
});
