import { useT } from "@/i18n";
import type { ResourceContent, ResourceDiffProps } from "@/resources";
import { LfsCard } from "./LfsCard";
import { parseLfsPointer } from "./lfsPointer";

function pointerOf(content: ResourceContent) {
	return content.kind === "text" ? parseLfsPointer(content.text) : null;
}

export default function LfsDiff({ original, modified }: ResourceDiffProps) {
	const t = useT();
	return (
		<div
			data-testid="lfs-diff"
			className="grid h-full grid-cols-1 content-start gap-12 bg-container-content-bg p-24 md:grid-cols-2"
		>
			{original.kind === "absent" ? (
				<div className="tr-text-metadata text-text-muted">{t("lfs.oldNoPointer")}</div>
			) : (
				<LfsCard
					label={t("visual.old")}
					pointer={pointerOf(original)}
					testid="lfs-pointer-original"
				/>
			)}
			{modified.kind === "absent" ? (
				<div className="tr-text-metadata text-text-muted">{t("lfs.newNoPointer")}</div>
			) : (
				<LfsCard
					label={t("visual.new")}
					pointer={pointerOf(modified)}
					testid="lfs-pointer-modified"
				/>
			)}
		</div>
	);
}
