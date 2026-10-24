"use client";

import { useState } from "react";

/** Optional demo control — no camera required; nothing is stored or sent. */
export function FocusModeHint() {
  const [on, setOn] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm dark:border-slate-600">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="font-semibold">Focus Mode (optional demo)</span>
      </label>
      <p className="mt-1 text-xs text-slate-500">
        {on
          ? "Pacing slowed for this session. Gaze would stay in-browser only — never stored or sent. Camera not used in this demo build."
          : "Turn on to simulate adaptive pacing. Camera is never required."}
      </p>
    </div>
  );
}
