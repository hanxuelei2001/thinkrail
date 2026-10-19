import { formatNumber, t, useT } from "@/i18n";
import type { ResourceContent, ResourceDiffProps } from "@/resources";

function sideSize(content: ResourceContent): string {
	if (content.kind === "absent") return t("binary.absent");
	if (content.kind === "bytes")
		return t("common.bytes", { count: formatNumber(content.byteLength) });
	return t("common.bytes", {
		count: formatNumber(new TextEncoder().encode(content.text).byteLength),
	});
}

export default function BinaryDiff({ original, modified }: ResourceDiffProps) {
	const t = useT();
	return (
		<div className="flex h-full items-center justify-center bg-container-content-bg p-24">
			<section
				data-testid="binary-diff"
				className="w-full max-w-lg rounded-md border border-border-default bg-container-header-bg p-16 text-center"
			>
				<h2 className="tr-title-entity text-text-default">{t("binary.filesDiffer")}</h2>
				<div className="mt-12 flex items-center justify-center gap-24 tr-text-metadata text-text-muted">
					<span>{t("binary.original", { size: sideSize(original) })}</span>
					<span>{t("binary.modified", { size: sideSize(modified) })}</span>
				</div>
			</section>
		</div>
	);
}
