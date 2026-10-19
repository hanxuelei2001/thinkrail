import { RiCheckLine as Check, RiArrowDownSLine as ChevronDown } from "@remixicon/react";
import { Button } from "@thinkrail/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@thinkrail/ui/dropdown-menu";
import {
	isLocalePreference,
	type LocalePreference,
	setLocalePreference,
	useLocalePreference,
	useT,
} from "@/i18n";
import { SettingsGroup, SettingsPageContainer } from "./SettingsGroup";
import { SettingsRow } from "./SettingsRow";

export function LanguageSettings() {
	const t = useT();
	const preference = useLocalePreference();
	const options: Array<{ value: LocalePreference; label: string }> = [
		{ value: "system", label: t("settings.language.system") },
		{ value: "en", label: t("settings.language.english") },
		{ value: "zh-CN", label: t("settings.language.chinese") },
	];
	const current = options.find((option) => option.value === preference) ?? options[0];

	return (
		<SettingsPageContainer testId="settings-language">
			<SettingsGroup title={t("settings.language.title")}>
				<SettingsRow
					label={t("settings.language.label")}
					description={t("settings.language.description")}
					control={
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									aria-label={t("settings.language.trigger", { language: current?.label ?? "" })}
									data-testid="language-trigger"
									className="h-32 justify-between"
								>
									<span className="truncate">{current?.label}</span>
									<ChevronDown className="size-16" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
							>
								<DropdownMenuRadioGroup
									value={preference}
									onValueChange={(value) => {
										if (isLocalePreference(value)) setLocalePreference(value);
									}}
								>
									{options.map((option) => (
										<DropdownMenuRadioItem
											key={option.value}
											value={option.value}
											data-testid={`language-option-${option.value}`}
										>
											{option.value === preference ? (
												<Check className="size-14 text-primary" />
											) : (
												<span className="size-14" />
											)}
											<span>{option.label}</span>
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					}
				/>
			</SettingsGroup>
		</SettingsPageContainer>
	);
}
