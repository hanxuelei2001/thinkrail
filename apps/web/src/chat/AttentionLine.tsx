import { RiQuestionnaireLine as MessageCircleQuestion } from "@remixicon/react";
import { useT } from "@/i18n";

export function AttentionLine({
	announced = false,
	live = true,
}: {
	announced?: boolean;
	live?: boolean;
}) {
	const t = useT();
	return (
		<div className="flex items-center gap-4 text-primary tr-text-action">
			<span aria-hidden={!live || announced || undefined} className="flex items-center gap-4">
				<MessageCircleQuestion className="size-14 shrink-0" />
				<span>{t("chat.attentionInput")}</span>
				<span className="text-text-muted tr-text-metadata">· {t("chat.attentionWaiting")}</span>
			</span>
			{live ? (
				<span role="status" aria-live="polite" className="sr-only">
					{announced ? t("chat.attentionAnnounced") : ""}
				</span>
			) : null}
		</div>
	);
}
