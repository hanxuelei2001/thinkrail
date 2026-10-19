---
id: submodule-web-i18n
type: submodule-design
status: active
title: i18n — typed English/Simplified-Chinese message catalogs and locale subscription
parent: module-web
tags: [ui, i18n]
---

## Responsibility

The browser-side localization layer: resolves and persists the display-language preference, owns the
typed message catalogs, translates and interpolates messages, exposes locale-aware `Intl` formatting, and
notifies React when the language changes. The English catalog is the source of truth; Simplified Chinese
is a complete, compile-time-checked peer.

The preference is client-local (`system` / `en` / `zh-CN`) rather than host config: language is a property
of the device a person is reading on, like the first-paint theme hint, and changing it must not round-trip
through the host. `system` resolves any `zh*` browser language to `zh-CN` and everything else to `en`; a
future Traditional Chinese catalog opts in with its own resolved locale rather than silently borrowing the
Simplified strings. `panels/LanguageSettings.tsx` is the only settings surface that writes the preference;
a change applies immediately, updates `<html lang>`, and persists through the stable preference adapter.

## Boundary

- **Owns:** the locale preference store and its stable-preference persistence; system-language resolution;
  the `en` / `zh-CN` catalogs; key typing, interpolation, and plural selection; the React subscription
  (`useLocale` / `useLocalePreference` / `useT`); `Intl` number/date/relative-time formatters; and the
  pre-React `document.documentElement.lang` update.
- **Public surface:** `index.ts` only — `initializeI18n`, `getLocale`, `getLocalePreference`,
  `getLocaleState`, `setLocalePreference`, `readLocalePreference`, `resolveLocalePreference`,
  `subscribeLocale`, `isLocalePreference`, `useLocale`, `useLocalePreference`, `useT`, `t`,
  `formatNumber`, `formatDateTime`, `formatRelativeTime`, and the locale/message types.
- **Allowed external deps:** React (hooks only), browser storage/media APIs, `Intl`, and the app's
  feature-neutral `clientPreferences` + `constants/branding` leaves.
- **Forbidden:** store, transport, panels, shell, server/shared/pi; runtime catalog registration; HTML or
  executable code in messages; reading a mutable module singleton during React render.

## Message rules

- **`en.ts` is the source of truth.** `zh-CN.ts` is typed as `satisfies Record<MessageKey, Message>`, so a
  missing or renamed key is a TypeScript error; `messages.test.ts` additionally checks placeholder parity,
  empty values, and that no catalog key is orphaned.
- **Components use `useT()`.** It subscribes to the locale store through `useSyncExternalStore`, so a
  language switch re-renders consumers and the React Compiler sees the dependency. A module-level `t()` is
  only for event handlers, async callbacks, and other non-render code; render code that reads `t()` would
  not update on a switch and is a review error.
- **User-facing text does not live in a component after migration.** A component names a key; the catalog
  owns the sentence. Selectors and pure helpers return language-neutral data (a reason code, a timestamp,
  a count), and the consuming component translates and formats it.
- **Keys are stable names, not English copy:** `<area>.<feature>.<purpose>` (`settings.nav.appearance`,
  `chat.error.switchModel`). Placeholders are named (`{model}`, `{count}`); a message never contains HTML.
- **Do not translate:** user content, file paths, branch/project/session names, code, terminal output,
  diffs, model/provider/tool identifiers, keyboard glyphs, logs, and agent-provided text. Agent replies
  follow the language the user writes in; the UI locale never changes the `pi` system prompt or tools.
- **English stays complete.** A missing translation falls back to English at runtime, but the typed catalog
  and parity test make that a development error rather than a shipped blank.
