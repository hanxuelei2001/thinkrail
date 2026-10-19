import { RiDownloadCloud2Line as DownloadCloud } from "@remixicon/react";
import { Button } from "@thinkrail/ui/button";
import { useT } from "@/i18n";
import type { UpdatesController } from "./useUpdates";

export function UpdateReadyButton({
	updates,
	onOpen,
}: {
	updates: UpdatesController;
	onOpen(): void;
}) {
	const t = useT();
	const hostUpdate = updates.source === "host";
	const hostStatus = updates.source === "host" ? updates.state.status : undefined;
	const hostRequestFailed = updates.source === "host" && updates.requestFailed;
	const nativeState = updates.source === "native" ? updates.state : null;
	const nativeNeedsAttention = updates.source === "native" && updates.requestError !== null;
	const nativeActionable =
		nativeNeedsAttention ||
		nativeState?.status === "available" ||
		nativeState?.status === "downloading" ||
		nativeState?.status === "preparing" ||
		nativeState?.status === "ready" ||
		nativeState?.status === "installing" ||
		nativeState?.status === "error";
	if (!nativeActionable && !hostUpdate) return null;

	const availableVersion = updates.state.availableVersion;
	let label = t("updates.readyButton.attention");
	let ariaLabel = availableVersion
		? t("updates.readyButton.attentionVersion", { version: availableVersion })
		: t("updates.readyButton.attentionGeneric");
	if (hostUpdate) {
		if (hostRequestFailed || hostStatus === "failed") {
			label = t("updates.readyButton.failed");
			ariaLabel = t("updates.readyButton.failedAria");
		} else if (hostStatus === "running") {
			label = t("updates.readyButton.updatingHost");
			ariaLabel = availableVersion
				? t("updates.readyButton.updatingHostVersion", { version: availableVersion })
				: t("updates.readyButton.updatingHostGeneric");
		} else if (hostStatus === "succeeded") {
			label = t("updates.readyButton.restartHost");
			ariaLabel = availableVersion
				? t("updates.readyButton.restartHostVersion", { version: availableVersion })
				: t("updates.readyButton.restartHostGeneric");
		} else {
			label = t("updates.readyButton.available");
			ariaLabel = availableVersion
				? t("updates.readyButton.availableVersion", { version: availableVersion })
				: t("updates.readyButton.availableGeneric");
		}
	} else if (!nativeNeedsAttention && nativeState) {
		switch (nativeState.status) {
			case "available":
				label = t("updates.readyButton.available");
				ariaLabel = availableVersion
					? t("updates.readyButton.availableDownloadVersion", { version: availableVersion })
					: t("updates.readyButton.availableDownloadGeneric");
				break;
			case "downloading":
				label =
					typeof nativeState.progress === "number"
						? t("updates.readyButton.downloadingPercent", {
								percent: Math.round(nativeState.progress),
							})
						: t("updates.readyButton.downloading");
				ariaLabel = label;
				break;
			case "preparing":
				label = t("updates.readyButton.preparing");
				ariaLabel = label;
				break;
			case "ready":
				label = t("updates.readyButton.ready");
				ariaLabel = availableVersion
					? t("updates.readyButton.readyVersion", { version: availableVersion })
					: t("updates.readyButton.readyGeneric");
				break;
			case "installing":
				label = t("updates.readyButton.installing");
				ariaLabel = label;
				break;
		}
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			data-testid="update-ready"
			data-source={updates.source}
			data-status={nativeState?.status ?? hostStatus ?? (hostUpdate ? "legacy" : undefined)}
			aria-label={ariaLabel}
			onClick={onOpen}
			className="text-primary"
		>
			<DownloadCloud className="size-14" />
			<span className="hidden md:inline">{label}</span>
		</Button>
	);
}
