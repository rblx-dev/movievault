import { cookies, headers } from "next/headers";
import { isSupportedLang, LANGUAGE_COOKIE } from "./i18n";

export async function getSiteLang(): Promise<string> {
  try {
    const store = await cookies();
    const cookieLang = store.get(LANGUAGE_COOKIE)?.value;
    if (isSupportedLang(cookieLang)) return cookieLang;
  } catch {
    // cookies unavailable
  }

  try {
    const hdrs = await headers();
    const accept = hdrs.get("accept-language") ?? "";
    const first = accept.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
    const base = first?.split("-")[0];
    if (isSupportedLang(base)) return base;
  } catch {
    // headers unavailable
  }

  return "en";
}
