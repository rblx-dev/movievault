import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import {
  getWatchProviders,
  MediaType,
  providerLogoUrl,
  WatchProviders as WatchProvidersData,
} from "@/lib/tmdb";

type WatchProvidersProps = {
  id: string | number;
  type: MediaType;
};

const GROUPS = [
  { key: "flatrate", label: "Stream" },
  { key: "free", label: "Free" },
  { key: "ads", label: "With Ads" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
] as const;

export async function WatchProviders({ id, type }: WatchProvidersProps) {
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
        <h2>Where to Watch</h2>
        <p>Everywhere this title is currently available to stream, rent, or buy.</p>
      </div>
      {groups.map((group) => (
        <div key={group.key} className="watch__group">
          <h3 className="watch__group-label">{group.label}</h3>
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
