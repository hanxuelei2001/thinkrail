import { useEffect, useState } from "react";

type Locale = "en" | "zh-CN";

const MESSAGES = {
	en: {
		rendering: "Rendering…",
		noDiagram: "(no diagram)",
		renderFailed: "Failed to render diagram",
		renderingDiagram: "Rendering diagram…",
		fullScreenAria: "View diagram full screen",
		fullScreen: "Full screen",
		diagram: "Diagram",
		diagramFailed: "Diagram failed to render: {error}",
		zoomOut: "Zoom out",
		zoomIn: "Zoom in",
		resetZoom: "Reset zoom",
		visualizationFailed: "Visualization failed.",
	},
	"zh-CN": {
		rendering: "渲染中…",
		noDiagram: "（无图表）",
		renderFailed: "渲染图表失败",
		renderingDiagram: "正在渲染图表…",
		fullScreenAria: "全屏查看图表",
		fullScreen: "全屏",
		diagram: "图表",
		diagramFailed: "图表渲染失败：{error}",
		zoomOut: "缩小",
		zoomIn: "放大",
		resetZoom: "重置缩放",
		visualizationFailed: "可视化失败。",
	},
} as const;

export type VisualizeMessageKey = keyof (typeof MESSAGES)["en"];

function currentLocale(): Locale {
	if (typeof document === "undefined") return "en";
	return document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export function useVisualizeT(): (
	key: VisualizeMessageKey,
	params?: Record<string, string | number>,
) => string {
	const [locale, setLocale] = useState<Locale>(() => currentLocale());
	useEffect(() => {
		if (typeof MutationObserver === "undefined") return;
		const observer = new MutationObserver(() => setLocale(currentLocale()));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
		return () => observer.disconnect();
	}, []);
	return (key, params) => {
		const template = MESSAGES[locale][key];
		if (!params) return template;
		return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ""));
	};
}
