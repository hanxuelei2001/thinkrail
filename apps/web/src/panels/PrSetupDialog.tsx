import {
	RiCheckLine as Check,
	RiFileCopyLine as Copy,
	RiExternalLinkLine as ExternalLink,
	RiPlayLine as Play,
	RiRefreshLine as RefreshCw,
} from "@remixicon/react";
import type { GhSetupProblem, HostPlatform } from "@thinkrail/contracts";
import { Button, buttonVariants } from "@thinkrail/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@thinkrail/ui/dialog";
import { useState } from "react";
import { t, useT } from "@/i18n";
import { copyText } from "@/lib";

export type PrSetupState =
	| { kind: "push-auth"; detail: string }
	| { kind: "gh"; problem: GhSetupProblem; compareUrl?: string };

function CommandRow({ command, onRun }: { command: string; onRun: (command: string) => void }) {
	const t = useT();
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		if (await copyText(command)) {
			setCopied(true);
			setTimeout(() => setCopied(false), 1_500);
		}
	};
	return (
		<div className="flex items-center gap-8 rounded-sm border border-border-default bg-control-bg px-12 py-8">
			<code className="min-w-0 flex-1 truncate tr-code-text text-text-default">{command}</code>
			<Button
				variant="ghost"
				size="icon"
				data-testid="open-pr-setup-copy"
				aria-label={t("prSetup.copyCommand")}
				onClick={() => void copy()}
			>
				{copied ? (
					<Check className="size-14 text-feedback-success" />
				) : (
					<Copy className="size-14" />
				)}
			</Button>
			<Button
				variant="outline"
				size="sm"
				data-testid="open-pr-setup-run"
				title={t("prSetup.runTitle")}
				onClick={() => onRun(command)}
			>
				<Play className="size-14" />
				{t("prSetup.run")}
			</Button>
		</div>
	);
}

function ghTitle(problem: GhSetupProblem): string {
	return problem === "missing"
		? t("prSetup.gh.missingTitle")
		: t("prSetup.gh.unauthenticatedTitle");
}

function ghDescription(problem: GhSetupProblem): string {
	return problem === "missing"
		? t("prSetup.gh.missingDescription")
		: t("prSetup.gh.unauthenticatedDescription");
}

const SSH_ADD_COMMAND: Record<HostPlatform, string> = {
	darwin: "ssh-add --apple-use-keychain ~/.ssh/id_ed25519",
	linux: "ssh-add ~/.ssh/id_ed25519",
	win32: "ssh-add $env:USERPROFILE\\.ssh\\id_ed25519",
};

const GH_INSTALL_COMMAND: Record<HostPlatform, string | null> = {
	darwin: "brew install gh",
	linux: "sudo apt install gh",
	win32: "winget install --id GitHub.cli",
};

const HOST_KEY_PATTERN = /host key verification failed/i;

function sshAddCommand(platform: HostPlatform | null): string {
	return platform ? SSH_ADD_COMMAND[platform] : "ssh-add ~/.ssh/id_ed25519";
}

function sshAddHint(platform: HostPlatform | null): string {
	switch (platform) {
		case "darwin":
			return t("prSetup.ssh.hint.darwin");
		case "linux":
			return t("prSetup.ssh.hint.linux");
		case "win32":
			return t("prSetup.ssh.hint.win32");
		default:
			return t("prSetup.ssh.hint.generic");
	}
}

function ghCommands(problem: GhSetupProblem, platform: HostPlatform | null): string[] {
	const install = platform ? GH_INSTALL_COMMAND[platform] : null;
	return problem === "missing" && install ? [install, "gh auth login"] : ["gh auth login"];
}

function ghInstallHint(problem: GhSetupProblem, platform: HostPlatform | null): string | null {
	if (problem !== "missing") return null;
	if (!platform) return t("prSetup.gh.installHint.generic");
	return platform === "linux"
		? t("prSetup.gh.installHint.linux")
		: t("prSetup.gh.installHint.generic");
}

export function PrSetupDialog({
	state,
	platform,
	onClose,
	onRetry,
	onRun,
	onCompareOpen,
}: {
	state: PrSetupState | null;
	platform: HostPlatform | null;
	onClose: () => void;
	onRetry: () => void;
	onRun: (command: string) => void;
	onCompareOpen: () => void;
}) {
	const t = useT();
	return (
		<Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				data-testid="open-pr-setup-dialog"
				data-reason={state?.kind === "gh" ? `gh-${state.problem}` : state?.kind}
			>
				{state?.kind === "push-auth" ? (
					<>
						<DialogHeader>
							<DialogTitle>{t("prSetup.pushAuth.title")}</DialogTitle>
							<DialogDescription>{t("prSetup.pushAuth.description")}</DialogDescription>
						</DialogHeader>
						<pre
							data-testid="open-pr-setup-detail"
							className="max-h-128 overflow-auto whitespace-pre-wrap rounded-sm border border-border-default bg-control-bg px-12 py-8 tr-code-text text-feedback-error"
						>
							{state.detail}
						</pre>
						<div className="flex flex-col gap-8">
							{HOST_KEY_PATTERN.test(state.detail) ? (
								<>
									<p className="tr-text-ui text-text-muted">
										This host's SSH key isn't in known_hosts yet — connect once and answer "yes" to
										approve it:
									</p>
									<CommandRow command="ssh -T git@github.com" onRun={onRun} />
								</>
							) : null}
							<p className="tr-text-ui text-text-muted">{sshAddHint(platform)}</p>
							<CommandRow command={sshAddCommand(platform)} onRun={onRun} />
							<p className="tr-text-ui text-text-muted">{t("prSetup.pushAuth.https")}</p>
							<CommandRow command="gh auth login" onRun={onRun} />
						</div>
					</>
				) : state?.kind === "gh" ? (
					<>
						<DialogHeader>
							<DialogTitle>{ghTitle(state.problem)}</DialogTitle>
							<DialogDescription>{ghDescription(state.problem)}</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-8">
							{ghInstallHint(state.problem, platform) ? (
								<p className="tr-text-ui text-text-muted">
									{ghInstallHint(state.problem, platform)}
								</p>
							) : null}
							{ghCommands(state.problem, platform).map((command) => (
								<CommandRow key={command} command={command} onRun={onRun} />
							))}
						</div>
						{state.compareUrl ? (
							<p className="tr-text-ui text-text-muted">
								No rush — GitHub's compare page can create this PR right now, prefilled from the
								plan.
							</p>
						) : null}
					</>
				) : null}
				<DialogFooter>
					{state?.kind === "gh" && state.compareUrl ? (
						<a
							data-testid="open-pr-setup-compare"
							href={state.compareUrl}
							target="_blank"
							rel="noopener noreferrer"
							onClick={onCompareOpen}
							className={buttonVariants({ variant: "outline" })}
						>
							<ExternalLink className="size-14" />
							Open compare page
						</a>
					) : null}
					<Button data-testid="open-pr-setup-retry" onClick={onRetry}>
						<RefreshCw className="size-14" />
						Try again
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
