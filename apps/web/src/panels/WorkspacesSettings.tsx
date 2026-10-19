import { WORKSPACE_SETTLE_PROTOCOL_VERSION } from "@thinkrail/contracts";
import { type TFunction, useT } from "@/i18n";
import { toast, useAppStore } from "../store";
import { getTransport } from "../transport";
import { SettingsRadioCards, type SettingsRadioChoice } from "./SettingsRadioCards";

type IdleChoice = `${number}` | "never";

function idleChoices(t: TFunction): readonly SettingsRadioChoice<IdleChoice>[] {
	return [
		{
			id: "1",
			label: t("settings.workspaces.oneDay"),
			description: t("settings.workspaces.oneDay.description"),
			testId: "settle-idle-1",
		},
		{
			id: "3",
			label: t("settings.workspaces.threeDays"),
			description: t("settings.workspaces.threeDays.description"),
			testId: "settle-idle-3",
		},
		{
			id: "7",
			label: t("settings.workspaces.sevenDays"),
			hint: t("settings.workspaces.default"),
			description: t("settings.workspaces.sevenDays.description"),
			testId: "settle-idle-7",
		},
		{
			id: "14",
			label: t("settings.workspaces.fourteenDays"),
			description: t("settings.workspaces.fourteenDays.description"),
			testId: "settle-idle-14",
		},
		{
			id: "never",
			label: t("settings.workspaces.never"),
			description: t("settings.workspaces.never.description"),
			testId: "settle-idle-never",
		},
	];
}

export function toChoice(days: number | null): IdleChoice {
	return days === null ? "never" : (String(days) as IdleChoice);
}

export function WorkspacesSettings() {
	const t = useT();
	const settleIdleDays = useAppStore((s) => s.settleIdleDays);
	const protocolVersion = useAppStore((s) => s.protocolVersion);
	const supported =
		protocolVersion !== null && protocolVersion >= WORKSPACE_SETTLE_PROTOCOL_VERSION;

	const select = (choice: IdleChoice) => {
		const next = choice === "never" ? null : Number(choice);
		if (next === settleIdleDays) return;
		getTransport()
			.request("settings.update", { config: { settleIdleDays: next } })
			.catch(() => toast.error(t("settings.workspaces.error.settleWindow")));
	};

	return (
		<section data-testid="settings-workspaces" className="flex flex-col gap-16">
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4">
					<h3 className="tr-title-section text-text-default">{t("settings.workspaces.title")}</h3>
					<p className="text-text-muted tr-text-metadata">{t("settings.workspaces.description")}</p>
				</div>
				<SettingsRadioCards
					name="settle-idle-days"
					label={t("settings.workspaces.title")}
					choices={idleChoices(t)}
					value={toChoice(settleIdleDays)}
					disabled={!supported}
					onSelect={select}
				/>
			</div>
		</section>
	);
}
