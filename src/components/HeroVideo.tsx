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

const EMBED_PARAMS =
  "autoplay=1&mute=1&controls=0&loop=1&playlist={{KEY}}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&vq=hd2160";

function createEmbedFrame(videoKey: string): HTMLIFrameElement {
  const frame = document.createElement("iframe");
  frame.src = `https://www.youtube-nocookie.com/embed/${videoKey}?${EMBED_PARAMS.replace("{{KEY}}", videoKey)}`;
  frame.title = "";
  frame.loading = "eager";
  frame.allow = "autoplay; encrypted-media; picture-in-picture";
  frame.tabIndex = -1;
  return frame;
}

export function HeroVideo({ videoKey }: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;
    const el = containerRef.current;
    if (!el) return;

    const setShown = () => {
      if (!cancelled) setVisible(true);
    };

    el.appendChild(createEmbedFrame(videoKey));
    setShown();

    try {
      ensureYouTubeAPI(() => {
        if (cancelled || !el || !window.YT) return;
        el.querySelectorAll("iframe").forEach((frame) => frame.remove());
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
              setShown();
              event.target.mute();
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (event.data === window.YT!.PlayerState.PLAYING) {
                setShown();
              } else if (event.data === window.YT!.PlayerState.ENDED) {
                player?.playVideo();
              }
            },
          },
        });
      });
    } catch {
      setShown();
    }

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        void 0;
      }
      el.innerHTML = "";
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
