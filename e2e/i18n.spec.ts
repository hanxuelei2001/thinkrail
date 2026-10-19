import { expect, test } from "@playwright/test";

test("the display language switches at runtime and survives a reload", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByTestId("connection-status")).toHaveAttribute("data-status", "connected");
	await expect(page.locator("html")).toHaveAttribute("lang", "en");

	await page.getByTestId("open-settings").click();
	await expect(page.getByTestId("settings-dialog")).toBeVisible();
	await page.getByTestId("settings-nav-language").click();
	await expect(page.getByTestId("settings-language")).toContainText("Display language");

	await page.getByTestId("language-trigger").click();
	await page.getByTestId("language-option-zh-CN").click();

	await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
	const fontFamily = await page
		.locator("body")
		.evaluate((node) => getComputedStyle(node).fontFamily);
	expect(fontFamily).toContain("PingFang SC");
	await expect(page.getByTestId("settings-dialog")).toContainText("显示语言");
	await expect(page.getByTestId("settings-nav-models")).toContainText("模型");

	await page.reload();
	await expect(page.getByTestId("connection-status")).toHaveAttribute("data-status", "connected");
	await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
	await page.getByTestId("open-settings").click();
	await expect(page.getByTestId("settings-dialog")).toContainText("设置");
});
