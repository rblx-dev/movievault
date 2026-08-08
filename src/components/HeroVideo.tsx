"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  videoKey: string;
  soundOn?: boolean;
};

function embedUrl(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&vq=hd2160&cc_load_policy=0&cc_lang_pref=en&enablejsapi=1`;
}

function postCommand(frame: HTMLIFrameElement, func: string, args: unknown[] = []) {
  try {
    frame.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  } catch {
    // ignore cross-origin failures
  }
}

export function HeroVideo({ videoKey, soundOn = false }: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
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
    frameRef.current = frame;
    setVisible(true);
  }, [videoKey]);

  useEffect(() => {
    if (!soundOn) return;
    const frame = frameRef.current;
    if (!frame) return;

    const steps = 12;
    let step = 0;

    const ramp = window.setInterval(() => {
      step += 1;
      const volume = Math.round((step / steps) * 100);
      postCommand(frame, "setVolume", [volume]);
      postCommand(frame, "unMute", []);
      if (step >= steps) {
        window.clearInterval(ramp);
      }
    }, 80);

    return () => window.clearInterval(ramp);
  }, [soundOn]);

  return (
    <div
      ref={containerRef}
      className={`hero__video${visible ? " is-playing" : ""}`}
      aria-hidden
    />
  );
}
