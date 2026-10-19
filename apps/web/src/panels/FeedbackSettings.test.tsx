import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { en } from "@/i18n/messages/en";
import { FeedbackSettings } from "./FeedbackSettings";
import { INTERVIEW_BOOKING_URL } from "./interview";

test("renders the approved feedback copy and external booking anchor", () => {
	const markup = renderToStaticMarkup(<FeedbackSettings />);

	expect(markup).toContain(en["settings.feedback.invitation"]);
	expect(markup).toContain(`href="${INTERVIEW_BOOKING_URL}"`);
	expect(markup).toContain('target="_blank"');
	expect(markup).toContain('rel="noopener noreferrer"');
	expect(markup).toContain(en["settings.feedback.schedule"]);
});
