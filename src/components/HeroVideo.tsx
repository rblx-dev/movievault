"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  videoKey: string;
};

type YTPlayer = {
  mute: () => void;
  playVideo: () => void;
  destroy: () => void;
};

type YTPlayerOptions = {
  videoId: string;
  width: string;
  height: string;
  playerVars: Record<string, string | number | boolean>;
  events: {
    onReady: (event: { target: YTPlayer }) => void;
    onStateChange: (event: { data: number }) => void;
  };
};

declare global {
  interface Window {
    YT?: {
      PlayerState: { PLAYING: number; ENDED: number };
      Player: new (element: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let scriptInjected = false;
const apiQueue: Array<() => void> = [];

function ensureYouTubeAPI(cb: () => void) {
  if (window.YT?.Player) {
    cb();
    return;
  }
  apiQueue.push(cb);
  const drain = () => {
    if (window.YT?.Player) {
      apiQueue.splice(0).forEach((fn) => fn());
    }
  };
  if (!scriptInjected) {
    scriptInjected = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = drain;
    window.setTimeout(drain, 2500);
  }
}

export function HeroVideo({ videoKey }: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;
    const el = containerRef.current;
    if (!el) return;

    ensureYouTubeAPI(() => {
      if (cancelled || !el || el.querySelector("iframe") || !window.YT) return;
      player = new window.YT.Player(el, {
        videoId: videoKey,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          playlist: videoKey,
          rel: 0,
          showinfo: 0,
          vq: "hd2160",
        },
        events: {
          onReady: (event) => {
            setVisible(true);
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT!.PlayerState.PLAYING) {
              setVisible(true);
            } else if (event.data === window.YT!.PlayerState.ENDED) {
              player?.playVideo();
            }
          },
        },
      });
    });

    const fallback = window.setTimeout(() => setVisible(true), 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      try {
        player?.destroy();
      } catch {
        void 0;
      }
    };
  }, [videoKey]);

  return (
    <div
      ref={containerRef}
      className={`hero__video${visible ? " is-playing" : ""}`}
      aria-hidden
    />
  );
}
