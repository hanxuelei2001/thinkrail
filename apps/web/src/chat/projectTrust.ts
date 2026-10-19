import type {
	Project,
	ProjectResourceKind,
	ProjectTrustSummary,
	WsParams,
} from "@thinkrail/contracts";
import { getLocale, t } from "@/i18n";

export type ProjectTrustNotice =
	| { kind: "hidden" }
	| {
			kind: "untrusted";
			aliasSkills: number;
			piResources: ProjectResourceKind[];
			mcpServers: number;
	  }
	| { kind: "unacknowledged"; names: string[] }
	| { kind: "trusted"; aliasSkills: number };

type TrustRecord = Pick<Project, "trusted" | "piResourceTrust" | "acknowledgedSkills">;

export function deriveProjectTrustNotice(
	project: TrustRecord | undefined,
	summary: ProjectTrustSummary | null,
): ProjectTrustNotice {
	if (!project || !summary) return { kind: "hidden" };
	const mcpServers = summary.mcpServers ?? 0;
	const aliasPending = summary.aliasSkills.length > 0 && project.trusted !== true;
	const nativePending =
		(summary.piResources.length > 0 || mcpServers > 0) && project.piResourceTrust !== "granted";
	if (aliasPending || nativePending) {
		return {
			kind: "untrusted",
			aliasSkills: aliasPending ? summary.aliasSkills.length : 0,
			piResources: nativePending ? summary.piResources : [],
			mcpServers: nativePending ? mcpServers : 0,
		};
	}
	if (summary.aliasSkills.length === 0 && summary.piResources.length === 0 && mcpServers === 0)
		return { kind: "hidden" };
	const acknowledged = new Set(project.acknowledgedSkills ?? []);
	const names = summary.aliasSkills.filter((name) => !acknowledged.has(name));
	if (names.length > 0) return { kind: "unacknowledged", names };
	return { kind: "trusted", aliasSkills: summary.aliasSkills.length };
}

const LOADED_KINDS: ReadonlyArray<[ProjectResourceKind, string]> = [
	["skills", "trust.kind.skills"],
	["prompts", "trust.kind.prompts"],
	["themes", "trust.kind.themes"],
	["systemPrompt", "trust.kind.systemPrompt"],
	["subagents", "trust.kind.subagents"],
];
const CODE_KINDS: ReadonlyArray<[ProjectResourceKind, string]> = [
	["extensions", "trust.kind.extensions"],
	["settings", "trust.kind.settings"],
];

function joinWords(words: readonly string[]): string {
	if (words.length < 2) return words[0] ?? "";
	if (getLocale() === "zh-CN") return `${words.slice(0, -1).join("、")}和${words.at(-1)}`;
	return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

function namesOf(
	kinds: ReadonlyArray<[ProjectResourceKind, string]>,
	present: ReadonlySet<ProjectResourceKind>,
): string {
	const words = kinds
		.filter(([kind]) => present.has(kind))
		.map(([, key]) => t(key as Parameters<typeof t>[0]));
	return joinWords(words);
}

export function untrustedNoticeText(
	notice: Extract<ProjectTrustNotice, { kind: "untrusted" }>,
): string {
	const parts = [
		...(notice.aliasSkills > 0 ? [t("trust.skill", { count: notice.aliasSkills })] : []),
		...(notice.piResources.length > 0 ? [t("trust.piResources")] : []),
		...(notice.mcpServers > 0 ? [t("trust.mcp", { count: notice.mcpServers })] : []),
	];
	return t("trust.notice", { parts: joinWords(parts) });
}

export function trustEnablesText(
	notice: Extract<ProjectTrustNotice, { kind: "untrusted" }>,
): string | null {
	const present = new Set(notice.piResources);
	const loads = namesOf(LOADED_KINDS, present);
	const runs = namesOf(CODE_KINDS, present);
	const code = t("trust.code", { runs });
	const enables = !runs
		? loads
			? t("trust.enables.loads", { loads })
			: null
		: loads
			? t("trust.enables.both", { loads, code })
			: t("trust.enables.code", { code });
	if (notice.mcpServers === 0) return enables;
	const mcp = t("trust.mcpApproval", { count: notice.mcpServers });
	return enables ? `${enables} ${mcp}` : mcp;
}

export function trustGrantParams(
	projectId: string,
	notice: Extract<ProjectTrustNotice, { kind: "untrusted" }>,
): WsParams<"project.setTrust"> {
	return {
		id: projectId,
		trusted: true,
		...(notice.piResources.length > 0 || notice.mcpServers > 0 ? { resources: true } : {}),
	};
}

export function trustedNoticeText(
	notice: Extract<ProjectTrustNotice, { kind: "trusted" }>,
): string {
	return notice.aliasSkills > 0
		? t("trust.trustedSkills", { count: notice.aliasSkills })
		: t("trust.trustedResources");
}

export function canStopTrusting(project: TrustRecord | undefined): boolean {
	return project?.trusted === true || project?.piResourceTrust === "granted";
}

export function stopTrustingText(
	project: TrustRecord | undefined,
	supportsProjectTrust: boolean,
): string {
	return supportsProjectTrust && project?.piResourceTrust === "granted"
		? t("trust.stop.granted")
		: t("trust.stop.skills");
}
