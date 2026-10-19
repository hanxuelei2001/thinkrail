import type {
	McpListResult,
	McpRenderedTarget,
	McpServerEntryInput,
	McpServerSummary,
	WsParams,
} from "@thinkrail/contracts";
import { t } from "@/i18n";
import { type McpStateTone, mcpStateLabel, mcpStateTone, mcpToolCountLabel } from "@/lib";
import type { McpServerRow } from "@/store";
import { type McpEditableExposure, withEnabled, withExposure } from "./mcpEntries";

export type McpRowAction =
	| "sign-in"
	| "review"
	| "edit"
	| "test-connection"
	| "reconnect"
	| "reload"
	| "open-chat"
	| "show-log";

export interface McpRowView {
	label: string;
	tone: McpStateTone;
	reason?: string;
	action?: McpRowAction;
	secondary?: McpRowAction;
}

const DISABLED_IN_PI_SETTINGS = "pi settings (-builtin:mcp)";

export function mcpHandledElsewhereText(by: string): string {
	return by === DISABLED_IN_PI_SETTINGS
		? t("mcp.handled.piDisabled")
		: t("mcp.handled.byOther", { by });
}

export interface McpChatFailure {
	chat: string;
	error: string;
}

export function mcpChatFailureText(
	failures: readonly McpChatFailure[],
	targeted: number,
): string | null {
	const [first] = failures;
	if (!first) return null;
	return targeted === 1
		? first.error
		: failures.map((failure) => `${failure.chat}: ${failure.error}`).join("\n");
}

function firstLine(text: string | undefined): string | undefined {
	return text
		?.split("\n")
		.map((line) => line.trim())
		.find(Boolean);
}

const STATUS_LINE_TAIL = / \((?:codemode|deferred|direct|hidden)\)$/;
const STATE_PREFIX = /^(?:failed|disconnected|starting|connecting…?)(?::\s*|,\s*|$)/;

function mcpDetailReason(detail: string | undefined, name: string): string | undefined {
	const [head = "", ...rest] = (detail ?? "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	if (rest[0]) return rest[0];
	const body = head.startsWith(`${name}: `) ? head.slice(name.length + 2) : head;
	return body.replace(STATUS_LINE_TAIL, "").replace(STATE_PREFIX, "").trim() || undefined;
}

export function formatStartingElapsed(ms: number): string {
	const minutes = Math.floor(Math.max(0, ms) / 60_000);
	return minutes < 1 ? "<1 min" : `${minutes} min`;
}

function inChats(row: McpServerRow, count: number): string {
	return row.sessions.total > 1 ? t("mcp.row.inChats", { count, total: row.sessions.total }) : "";
}

export function mcpRowView(row: McpServerRow, now: number): McpRowView {
	const { summary } = row;
	const view = baseView(row, now);
	if (
		row.approvalPending &&
		row.state !== "pending-approval" &&
		row.state !== "handled-elsewhere"
	) {
		return {
			...view,
			reason:
				summary.approval?.state === "changed"
					? t("mcp.row.approvalChanged")
					: t("mcp.row.approvalOverride"),
			action: "review",
		};
	}
	return view;
}

function baseView(row: McpServerRow, now: number): McpRowView {
	const { summary } = row;
	const http = summary.transport === "http";
	switch (row.state) {
		case "replaced":
			return {
				label: t("mcp.row.replacedByProject"),
				tone: "neutral",
				reason: t("mcp.row.replacedReason"),
			};
		case "handled-elsewhere":
			return { label: mcpStateLabel("handled-elsewhere"), tone: "neutral" };
		case "starting":
			return {
				label: t("mcp.row.starting", {
					elapsed: formatStartingElapsed(now - (row.startingSince ?? now)),
				}),
				tone: "working",
				...(row.sessions.total > 1
					? {
							reason: t("mcp.row.startingReason", {
								chats: inChats(row, row.sessions.reporting.length),
							}),
						}
					: {}),
			};
		case "connected": {
			const tools = row.toolCount === undefined ? "" : ` · ${mcpToolCountLabel(row.toolCount)}`;
			return {
				label: t("mcp.row.connected", {
					chats: inChats(row, row.sessions.connected),
					tools,
				}),
				tone: mcpStateTone("connected", row.toolCount),
				...(row.toolCount === 0 ? { reason: t("mcp.row.noTools") } : {}),
			};
		}
		case "needs-sign-in":
			return {
				label: mcpStateLabel("needs-sign-in"),
				tone: "warning",
				reason: t("mcp.row.signInReason"),
				...(row.effective && summary.oauth ? { action: "sign-in" as const } : {}),
			};
		case "failed":
			return {
				label: mcpStateLabel("failed"),
				tone: "error",
				reason: mcpDetailReason(row.detail, summary.name) ?? t("mcp.row.failedStart"),
				action: "reconnect",
				secondary: "show-log",
			};
		case "disconnected":
			return {
				label: mcpStateLabel("disconnected"),
				tone: "warning",
				reason: t("mcp.row.reconnects"),
				action: "reconnect",
			};
		case "disabled":
			return { label: mcpStateLabel("disabled"), tone: "neutral", reason: t("mcp.row.turnedOff") };
		case "disabled-in-project":
			return {
				label: mcpStateLabel("disabled-in-project"),
				tone: "neutral",
				reason: t("mcp.row.turnedOffProject"),
			};
		case "disabled-in-chat":
			return {
				label:
					row.sessions.total > 1
						? t("mcp.row.disabledInChats", {
								count: row.sessions.reporting.length,
								total: row.sessions.total,
							})
						: t("mcp.row.disabledInOneChat"),
				tone: "neutral",
				reason: t("mcp.row.turnedOffChat"),
			};
		case "pending-approval":
			return summary.approval?.state === "changed"
				? {
						label: t("mcp.row.changedSinceApproval"),
						tone: "warning",
						reason: t("mcp.row.changedReason"),
						action: "review",
					}
				: {
						label: mcpStateLabel("pending-approval"),
						tone: "warning",
						reason: t("mcp.row.pendingReason"),
						action: "review",
					};
		case "invalid-config":
			return {
				label: mcpStateLabel("invalid-config"),
				tone: "error",
				reason: firstLine(summary.configError ?? row.detail) ?? t("mcp.row.piRejected"),
				...(summary.scope === "project" ? { action: "edit" as const } : {}),
			};
		case "pending-reload":
			return {
				label: mcpStateLabel("pending-reload"),
				tone: "info",
				reason: t("mcp.row.appliesIdle"),
				action: "reload",
			};
		case "not-running":
			return {
				label: mcpStateLabel("not-running"),
				tone: "neutral",
				reason: t("mcp.row.startsOnOpen"),
				action: "open-chat",
				...(row.effective && http ? { secondary: "test-connection" as const } : {}),
			};
		case "unknown":
			return {
				label: mcpStateLabel("unknown"),
				tone: "neutral",
				reason: row.startingStalled ? t("mcp.row.stillStarting") : t("mcp.row.notReported"),
			};
	}
}

export type McpSettingChange = { enabled: boolean } | { exposure: McpEditableExposure };

type McpSettingWrite =
	| { method: "mcp.setProjectOverride"; params: WsParams<"mcp.setProjectOverride"> }
	| { method: "mcp.update"; params: WsParams<"mcp.update"> };

/** The row's identity for a rewrite or removal: its scope and the fingerprint it was rendered with. */
export function mcpRenderedTarget(summary: McpServerSummary): McpRenderedTarget {
	return { scope: summary.scope, expectedFingerprint: summary.fingerprint };
}

export function mcpEntryUpdate(
	workspaceId: string,
	summary: McpServerSummary,
	entry: McpServerEntryInput,
): WsParams<"mcp.update"> {
	return { workspaceId, name: summary.name, entry, ...mcpRenderedTarget(summary) };
}

export function mcpSettingWrite(
	workspaceId: string,
	summary: McpServerSummary,
	change: McpSettingChange,
	projectEntry: McpServerEntryInput | null,
): McpSettingWrite {
	if (summary.scope === "user") {
		return {
			method: "mcp.setProjectOverride",
			params: { workspaceId, name: summary.name, ...change },
		};
	}
	if (!projectEntry) throw new Error(`Read "${summary.name}" from .pi/mcp.json first.`);
	return {
		method: "mcp.update",
		params: mcpEntryUpdate(
			workspaceId,
			summary,
			"enabled" in change
				? withEnabled(projectEntry, change.enabled)
				: withExposure(projectEntry, change.exposure),
		),
	};
}

export function mcpSaveFeedback(result: McpListResult): string {
	return result.statuses.length === 0
		? t("mcp.saveFeedback.idle")
		: t("mcp.saveFeedback.openChats");
}

export function mcpExposureLabel(exposure: McpEditableExposure): string {
	return exposure === "deferred"
		? t("mcp.exposure.deferred")
		: exposure === "direct"
			? t("mcp.exposure.direct")
			: t("mcp.exposure.hidden");
}

export function mcpConfiguredExposureText(summary: McpServerSummary): string {
	return summary.exposure === "codemode" ? t("mcp.configuredExposure.codemode") : summary.exposure;
}
