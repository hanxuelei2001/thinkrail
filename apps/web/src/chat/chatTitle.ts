import { normalizeSessionTitle, SESSION_TITLE_MAX_LENGTH } from "@thinkrail/contracts";
import { t } from "@/i18n";

export type PreparedChatTitle = { title: string } | { reason: string };

export function prepareChatTitle(titleInput: string): PreparedChatTitle {
	const title = normalizeSessionTitle(titleInput);
	if (title) return { title };
	return titleInput.trim()
		? { reason: t("chat.nameTooLong", { max: SESSION_TITLE_MAX_LENGTH }) }
		: { reason: t("chat.enterName") };
}
