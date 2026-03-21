"use client";

import { useEffect } from "react";
import EarthMoves from "@/app/watch/page";

interface DisplayConfig {
  customLabel: string;
  accentColor: string;
  cloudsOn: boolean;
  southPole: boolean;
  skinName: string;
  locationPins: { name: string; lat: number; lon: number }[];
}

export default function DisplayClient({ config }: { config: DisplayConfig }) {
  // Auto-reload every 30 minutes to stay fresh
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), 30 * 60 * 1000);
    return () => clearTimeout(t);
  }, []);

  const skin = (["default", "silver", "ice"].includes(config.skinName)
    ? config.skinName
    : "default") as "default" | "silver" | "ice";

  return (
    <EarthMoves
      displayMode
      initLocs={config.locationPins}
      initCloudsOn={config.cloudsOn}
      initSouthPole={config.southPole}
      initSkin={skin}
      customLabel={config.customLabel}
      accentColor={config.accentColor}
    />
  );
}
