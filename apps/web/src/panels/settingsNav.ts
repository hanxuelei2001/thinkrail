import {
	type RemixiconComponentType,
	RiApps2Line,
	RiBrainLine,
	RiChat2Line,
	RiDownloadCloud2Line,
	RiGitRepositoryLine,
	RiKeyLine,
	RiLayoutGridLine,
	RiLayoutTop2Line,
	RiNotification3Line,
	RiPaletteLine,
	RiPlugLine,
	RiPuzzle2Line,
	RiShieldCheckLine,
	RiTerminalBoxLine,
	RiTranslate2,
} from "@remixicon/react";
import {
	DEFAULT_MODEL_PROTOCOL_VERSION,
	EXTENSION_CATALOG_PROTOCOL_VERSION,
	MCP_PROTOCOL_VERSION,
	WORKSPACE_SETTLE_PROTOCOL_VERSION,
} from "@thinkrail/contracts";
import type { MessageKey } from "@/i18n";
import { SettingsSection } from "@/store";

export interface SettingsNavSection {
	id: SettingsSection;
	labelKey: MessageKey;
	icon: RemixiconComponentType;
	requiresInjectedContent?: true;
	requiresProtocolVersion?: number;
}

export interface SettingsNavGroup {
	labelKey: MessageKey;
	sections: SettingsNavSection[];
}

const NAV_GROUPS: SettingsNavGroup[] = [
	{
		labelKey: "settings.group.agent",
		sections: [
			{
				id: SettingsSection.Models,
				labelKey: "settings.nav.models",
				icon: RiBrainLine,
				requiresProtocolVersion: DEFAULT_MODEL_PROTOCOL_VERSION,
			},
			{ id: SettingsSection.Providers, labelKey: "settings.nav.providers", icon: RiKeyLine },
			{
				id: SettingsSection.Mcp,
				labelKey: "settings.nav.mcp",
				icon: RiPlugLine,
				requiresProtocolVersion: MCP_PROTOCOL_VERSION,
			},
			{ id: SettingsSection.Templates, labelKey: "settings.nav.templates", icon: RiLayoutGridLine },
		],
	},
	{
		labelKey: "settings.group.interface",
		sections: [
			{ id: SettingsSection.Chat, labelKey: "settings.nav.chat", icon: RiChat2Line },
			{ id: SettingsSection.Appearance, labelKey: "settings.nav.appearance", icon: RiPaletteLine },
			{ id: SettingsSection.Language, labelKey: "settings.nav.language", icon: RiTranslate2 },
			{ id: SettingsSection.Layout, labelKey: "settings.nav.layout", icon: RiLayoutTop2Line },
			{ id: SettingsSection.Terminal, labelKey: "settings.nav.terminal", icon: RiTerminalBoxLine },
		],
	},
	{
		labelKey: "settings.group.system",
		sections: [
			{
				id: SettingsSection.Workspaces,
				labelKey: "settings.nav.workspaces",
				icon: RiGitRepositoryLine,
				requiresProtocolVersion: WORKSPACE_SETTLE_PROTOCOL_VERSION,
			},
			{ id: SettingsSection.Github, labelKey: "settings.nav.integrations", icon: RiApps2Line },
			{
				id: SettingsSection.Extensions,
				labelKey: "settings.nav.extensions",
				icon: RiPuzzle2Line,
				requiresProtocolVersion: EXTENSION_CATALOG_PROTOCOL_VERSION,
			},
			{
				id: SettingsSection.Notifications,
				labelKey: "settings.nav.notifications",
				icon: RiNotification3Line,
			},
			{ id: SettingsSection.Privacy, labelKey: "settings.nav.privacy", icon: RiShieldCheckLine },
			{
				id: SettingsSection.Updates,
				labelKey: "settings.nav.updates",
				icon: RiDownloadCloud2Line,
				requiresInjectedContent: true,
			},
		],
	},
];

function isAvailable(
	section: SettingsNavSection,
	protocolVersion: number | null,
	hasUpdates: boolean,
): boolean {
	return (
		(!section.requiresInjectedContent || hasUpdates) &&
		(section.requiresProtocolVersion === undefined ||
			(protocolVersion !== null && protocolVersion >= section.requiresProtocolVersion))
	);
}

export function settingsNavGroups(
	protocolVersion: number | null,
	hasUpdates: boolean,
): SettingsNavGroup[] {
	return filterSettingsNavGroups(NAV_GROUPS, protocolVersion, hasUpdates);
}

export function filterSettingsNavGroups(
	groups: SettingsNavGroup[],
	protocolVersion: number | null,
	hasUpdates: boolean,
): SettingsNavGroup[] {
	return groups
		.map((group) => ({
			...group,
			sections: group.sections.filter((s) => isAvailable(s, protocolVersion, hasUpdates)),
		}))
		.filter((group) => group.sections.length > 0);
}

export function resolveSettingsSection(
	section: SettingsSection,
	groups: SettingsNavGroup[],
): SettingsSection {
	const available = groups.flatMap((g) => g.sections);
	if (section === SettingsSection.Feedback || available.some((s) => s.id === section)) {
		return section;
	}
	if (available.some((s) => s.id === SettingsSection.Appearance)) {
		return SettingsSection.Appearance;
	}
	return available[0]?.id ?? SettingsSection.Appearance;
}
