import { RiCheckLine as Check } from "@remixicon/react";
import { useT } from "@/i18n";

export function ViewedMark() {
	const t = useT();
	return (
		<span
			data-testid="change-viewed"
			role="img"
			aria-label={t("viewed.viewed")}
			title={t("viewed.viewed")}
			className="flex size-14 shrink-0 items-center justify-center rounded-xs bg-primary text-text-on-primary"
		>
			<Check className="size-10" />
		</span>
	);
}
