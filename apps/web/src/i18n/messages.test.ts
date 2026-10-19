import { expect, test } from "bun:test";
import { en } from "./messages/en";
import { zhCN } from "./messages/zh-CN";
import type { Message } from "./types";

function placeholders(message: Message): string[] {
	const values = typeof message === "string" ? [message] : [message.one, message.other];
	return [
		...new Set(values.flatMap((value) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? ""))),
	].sort();
}

test("both catalogs declare exactly the same keys", () => {
	expect(Object.keys(zhCN).sort()).toEqual(Object.keys(en).sort());
});

test("every translated message is non-empty and keeps the English placeholders", () => {
	for (const key of Object.keys(en) as Array<keyof typeof en>) {
		const english = en[key];
		const chinese = zhCN[key];
		expect(english, key).toBeDefined();
		expect(chinese, key).toBeDefined();
		const values = typeof chinese === "string" ? [chinese] : [chinese.one, chinese.other];
		for (const value of values) expect(value.trim(), key).not.toBe("");
		expect(placeholders(chinese), key).toEqual(placeholders(english));
	}
});
