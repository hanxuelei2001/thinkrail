import { expect, test } from "bun:test";
import { type TFunction, translate } from "@/i18n/translate";
import { glanceIcon } from "./TodoList";

const enT: TFunction = (key, params) => translate("en", key, params);

test("only an actual pending question tells the user that an answer is required", () => {
	expect(glanceIcon("waiting_question", enT).label).toBe("Needs your answer");
	expect(glanceIcon("waiting", enT).label).toBe("Paused");
});
