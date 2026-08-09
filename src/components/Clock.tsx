"use client";

import { useEffect, useState } from "react";

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const start = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, []);

  return (
    <time
      className="header-clock"
      dateTime={now ? now.toISOString() : undefined}
      aria-label="Current time, 24-hour format"
    >
      {now ? formatTime(now) : "\u00A0\u00A0\u00A0\u00A0\u00A0"}
    </time>
  );
}
