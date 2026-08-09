import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { t } from "@/lib/i18n";
import {
  getWatchProviders,
  MediaType,
  providerLogoUrl,
  WatchProviders as WatchProvidersData,
} from "@/lib/tmdb";

type WatchProvidersProps = {
  id: string | number;
  type: MediaType;
  lang?: string;
};

const GROUPS = [
  { key: "flatrate", labelKey: "detail.stream" },
  { key: "free", labelKey: "detail.free" },
  { key: "ads", labelKey: "detail.ads" },
  { key: "rent", labelKey: "detail.rent" },
  { key: "buy", labelKey: "detail.buy" },
] as const;

export async function WatchProviders({ id, type, lang = "en" }: WatchProvidersProps) {
  let providers: WatchProvidersData | null = null;
  try {
    providers = await getWatchProviders(id, type);
  } catch {
    providers = null;
  }

  const groups = GROUPS.filter((group) => (providers?.[group.key]?.length ?? 0) > 0);
  if (!providers || groups.length === 0) return null;

  return (
    <Reveal as="section" className="watch">
      <div className="section-heading">
        <h2>{t(lang, "detail.watchWhere")}</h2>
        <p>{t(lang, "detail.watchSub")}</p>
      </div>
      {groups.map((group) => (
        <div key={group.key} className="watch__group">
          <h3 className="watch__group-label">{t(lang, group.labelKey)}</h3>
          <ul className="watch__list">
            {providers[group.key]!.map((provider) => {
              const logo = providerLogoUrl(provider.logo_path);
              return (
                <li key={provider.provider_id} className="watch__provider">
                  {logo ? (
                    <Image
                      src={logo}
                      alt=""
                      width={48}
                      height={48}
                      className="watch__logo"
                    />
                  ) : (
                    <span className="watch__logo watch__logo--fallback">
                      {provider.provider_name.slice(0, 1)}
                    </span>
                  )}
                  <span className="watch__name">{provider.provider_name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </Reveal>
  );
}
