import { Button } from "@thinkrail/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@thinkrail/ui/dialog";
import { useRef } from "react";
import { useT } from "@/i18n";
import { toast, useAppStore } from "@/store";
import { selectNotificationChannel } from "./channel";
import { snoozePrompt } from "./notificationPrompt";

export function NotificationPermissionPrompt() {
	const t = useT();
	const open = useAppStore((state) => state.notificationPromptOpen);
	const pendingRef = useRef(false);

	const dismiss = () => {
		snoozePrompt();
		useAppStore.getState().closeNotificationPrompt();
	};

	const enable = () => {
		if (pendingRef.current) return;
		pendingRef.current = true;
		void selectNotificationChannel()
			.requestPermission()
			.then((result) => {
				if (result === "denied")
					toast.error(t("notificationPrompt.denied"), t("notificationPrompt.blocked"));
			})
			.finally(() => {
				pendingRef.current = false;
				useAppStore.getState().closeNotificationPrompt();
			});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) dismiss();
			}}
		>
			<DialogContent data-testid="notification-permission-prompt">
				<DialogHeader>
					<DialogTitle>{t("notificationPrompt.title")}</DialogTitle>
					<DialogDescription>{t("notificationPrompt.description")}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" data-testid="notification-not-now" onClick={dismiss}>
						{t("notificationPrompt.notNow")}
					</Button>
					<Button data-testid="notification-enable" onClick={enable}>
						{t("notificationPrompt.enable")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
