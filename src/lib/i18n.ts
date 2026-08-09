import { uiLanguageCodes, uiStrings } from "./i18n.translations";
import { LANGUAGE_COOKIE } from "./language-codes";

export { LANGUAGE_COOKIE };

export function translate(
  lang: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  let text = uiStrings[lang]?.[key] ?? uiStrings.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{{${name}}}`).join(String(value));
    }
  }
  return text;
}

export const t = translate;

export function isSupportedLang(code: string | null | undefined): code is string {
  return !!code && uiLanguageCodes.includes(code);
}

export function isSupportedLangCode(code: string): boolean {
  return uiLanguageCodes.includes(code);
}
