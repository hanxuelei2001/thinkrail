import type { HostPlatform, TerminalWindowsShell } from "@thinkrail/contracts";
import { WINDOWS_SHELL_SETTINGS_PROTOCOL_VERSION } from "@thinkrail/contracts";
import { type TFunction, useT } from "@/i18n";
import { toast, useAppStore } from "@/store";
import { getTransport } from "@/transport";
import { SegmentedControl, type SegmentedControlOption } from "./SegmentedControl";
import { SettingsRadioCards, type SettingsRadioChoice } from "./SettingsRadioCards";
import { SETTINGS_ROWS_CONTAINER } from "./SettingsRow";

type ScrollbackOption = "0" | "16" | "64" | "256" | "1024";

function scrollbackOptions(t: TFunction): SegmentedControlOption<ScrollbackOption>[] {
	return [
		{ id: "0", label: t("settings.terminal.scrollback.off"), testId: "terminal-replay-0" },
		{ id: "16", label: "16 KB", testId: "terminal-replay-16" },
		{ id: "64", label: "64 KB", testId: "terminal-replay-64" },
		{ id: "256", label: "256 KB", testId: "terminal-replay-256" },
		{ id: "1024", label: "1 MB", testId: "terminal-replay-1024" },
	];
}

function windowsShellChoices(t: TFunction): SettingsRadioChoice<TerminalWindowsShell>[] {
	return [
		{
			id: "auto",
			label: t("settings.terminal.shell.auto"),
			hint: t("settings.terminal.shell.recommended"),
			description: t("settings.terminal.shell.autoDescription"),
			testId: "terminal-shell-auto",
		},
		{
			id: "pwsh",
			label: t("settings.terminal.shell.pwsh"),
			description: t("settings.terminal.shell.pwshDescription"),
			testId: "terminal-shell-pwsh",
		},
		{
			id: "powershell",
			label: t("settings.terminal.shell.powershell"),
			description: t("settings.terminal.shell.powershellDescription"),
			testId: "terminal-shell-powershell",
		},
		{
			id: "cmd",
			label: t("settings.terminal.shell.cmd"),
			description: t("settings.terminal.shell.cmdDescription"),
			testId: "terminal-shell-cmd",
		},
	];
}

export function WindowsShellSettings({
	platform,
	protocolVersion,
	value,
	onSelect,
}: {
	platform: HostPlatform | null;
	protocolVersion: number | null;
	value: TerminalWindowsShell;
	onSelect: (shell: TerminalWindowsShell) => void;
}) {
	const t = useT();
	if (
		platform !== "win32" ||
		protocolVersion === null ||
		protocolVersion < WINDOWS_SHELL_SETTINGS_PROTOCOL_VERSION
	) {
		return null;
	}
	return (
		<div className="pt-24">
			<div className="flex flex-col">
				<div className="flex flex-col gap-2 pb-8">
					<h3 className="tr-title-section text-text-default">
						{t("settings.terminal.windowsShell")}
					</h3>
					<p className="tr-text-metadata text-text-muted">
						{t("settings.terminal.windowsShell.description")}
					</p>
				</div>
				<SettingsRadioCards
					name="terminal-windows-shell"
					label={t("settings.terminal.windowsShell")}
					choices={windowsShellChoices(t)}
					value={value}
					onSelect={onSelect}
				/>
			</div>
		</div>
	);
}

export function TerminalSettings() {
	const t = useT();
	const replayKb = useAppStore((s) => s.terminalReplayKb);
	const windowsShell = useAppStore((s) => s.terminalWindowsShell);
	const hostPlatform = useAppStore((s) => s.hostPlatform);
	const protocolVersion = useAppStore((s) => s.protocolVersion);

	const select = (kb: number) => {
		if (kb === replayKb) return;
		getTransport()
			.request("settings.update", { config: { terminalReplayKb: kb } })
			.catch(() => toast.error(t("settings.terminal.error.replay")));
	};

	const selectWindowsShell = (shell: TerminalWindowsShell) => {
		if (shell === windowsShell) return;
		getTransport()
			.request("settings.update", { config: { terminalWindowsShell: shell } })
			.catch(() => toast.error(t("settings.terminal.error.windowsShell")));
	};

	const scrollbackValue =
		scrollbackOptions(t).find((option) => Number(option.id) === replayKb)?.id ?? null;

	return (
		<div data-testid="settings-terminal" className={SETTINGS_ROWS_CONTAINER}>
			<div className="flex flex-col gap-12 py-12">
				<div className="flex flex-col gap-2">
					<span className="tr-text-ui text-text-default">{t("settings.terminal.scrollback")}</span>
					<span className="tr-text-metadata text-text-muted">
						{t("settings.terminal.scrollback.description")}
					</span>
				</div>
				<SegmentedControl
					name="terminal-scrollback"
					label={t("settings.terminal.scrollback.aria")}
					options={scrollbackOptions(t)}
					value={scrollbackValue}
					onSelect={(id) => select(Number(id))}
					testId="terminal-scrollback-control"
				/>
			</div>

			<WindowsShellSettings
				platform={hostPlatform}
				protocolVersion={protocolVersion}
				value={windowsShell}
				onSelect={selectWindowsShell}
			/>
		</div>
	);
}
