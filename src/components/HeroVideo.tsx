"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  videoKey: string;
};

function embedUrl(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&vq=hd2160&cc_load_policy=0&cc_lang_pref=en`;
}

export function HeroVideo({ videoKey }: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const frame = document.createElement("iframe");
    frame.src = embedUrl(videoKey);
    frame.title = "";
    frame.loading = "eager";
    frame.allow = "autoplay; encrypted-media; picture-in-picture";
    frame.tabIndex = -1;
    el.appendChild(frame);
    setVisible(true);
  }, [videoKey]);

  return (
    <div
      ref={containerRef}
      className={`hero__video${visible ? " is-playing" : ""}`}
      aria-hidden
    />
  );
}
