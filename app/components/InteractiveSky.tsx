"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Galaxy, type SkyPreset } from "./galaxy";

const PRESETS: { id: SkyPreset; label: string }[] = [
  { id: "earth", label: "Earth sky" },
  { id: "pixel", label: "Pixel sky" },
];

export function InteractiveSky({
  owner,
  storageKey,
  assetPrefix = "",
  placement = "site",
}: {
  owner: string;
  storageKey: string;
  assetPrefix?: string;
  placement?: "landing" | "site";
}) {
  const [calm, setCalm] = useState(false);
  const [colour, setColour] = useState(0);
  const [burst, setBurst] = useState(0);
  const [preset, setPreset] = useState<SkyPreset>("earth");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) setCalm(true);
    const respectPreference = () => {
      if (media.matches) setCalm(true);
    };
    media.addEventListener("change", respectPreference);

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "earth" || saved === "pixel") setPreset(saved);
    } catch {}

    return () => media.removeEventListener("change", respectPreference);
  }, [storageKey]);

  const selectPreset = (next: SkyPreset) => {
    setPreset(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {}
  };

  const fallbackStyle = {
    "--sky-fallback-image": `url("${assetPrefix}/loading-pixel-sky.png")`,
  } as CSSProperties;

  return (
    <div className={`sky-experience ${placement}-sky`} style={fallbackStyle}>
      <Galaxy
        calm={calm}
        colour={colour}
        burst={burst}
        preset={preset}
        assetPrefix={assetPrefix}
      />
      <div className="sky-dock" aria-label={`${owner} interactive sky controls`}>
        <label className="sky-select">
          <span>SKY</span>
          <select
            aria-label="Background preset"
            value={preset}
            onChange={(event) => selectPreset(event.target.value as SkyPreset)}
          >
            {PRESETS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setColour((current) => (current + 1) % 3)}
          aria-label="Change trail colour"
        >
          COLOUR <i className={`sky-swatch sky-swatch-${colour}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            setCalm(false);
            setBurst((current) => current + 1);
          }}
        >
          ✦ BURST
        </button>
        <button type="button" onClick={() => setCalm((current) => !current)} aria-pressed={calm}>
          {calm ? "WAKE SKY" : "CALM"}
        </button>
      </div>
    </div>
  );
}
