"use client";

import { useEffect } from "react";
import Image from "next/image";
import EarthMoves from "@/app/watch/page";

interface DisplayConfig {
  customLabel: string;
  accentColor: string;
  cloudsOn: boolean;
  southPole: boolean;
  skinName: string;
  skinMode?: string;
  locationPins: { name: string; lat: number; lon: number }[];
  aspectRatio?: string;
  displayScale?: number;
  refreshMinutes?: number;
  labelVisible?: boolean;
  showLogo?: boolean;
  brandingLayout?: string;
}

export default function DisplayClient({ config }: { config: DisplayConfig }) {
  const refreshMs = (config.refreshMinutes ?? 30) * 60 * 1000;

  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), refreshMs);
    return () => clearTimeout(t);
  }, [refreshMs]);

  const skin = (["default", "silver", "ice", "blue"].includes(config.skinName)
    ? config.skinName
    : "default") as "default" | "silver" | "ice" | "blue";

  const skinMode = (config.skinMode === "night" ? "night" : "default") as "default" | "night";

  const scale = config.displayScale ?? 1.0;
  const branding = config.brandingLayout ?? "logo_and_label";
  const showLabel = config.labelVisible !== false;
  const showLogo = config.showLogo !== false;
  const accent = config.accentColor ?? "#60a5fa";

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#000",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Watch — scaled if displayScale < 1 */}
      <div style={{
        width: "100%", height: "100%",
        transform: scale < 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center center",
      }}>
        <EarthMoves
          displayMode
          initLocs={config.locationPins}
          initCloudsOn={config.cloudsOn}
          initSouthPole={config.southPole}
          initSkin={skin}
          initSkinMode={skinMode}
          accentColor={accent}
          // No customLabel — we render branding ourselves below
        />
      </div>

      {/* Branding overlay */}
      {branding !== "none" && (
        <div style={{
          position: "absolute", bottom: "28px", left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "14px", zIndex: 20, pointerEvents: "none",
        }}>
          {(branding === "logo_only" || branding === "logo_and_label") && showLogo && (
            <Image
              src="/images/em-logo-white.png"
              alt="Earth Moves"
              width={120}
              height={24}
              style={{ height: "20px", width: "auto", opacity: 0.65 }}
              priority
            />
          )}
          {(branding === "label_only" || branding === "logo_and_label") && showLabel && config.customLabel && (
            <span style={{
              fontSize: "11px",
              color: accent + "bb",
              letterSpacing: "2.5px",
              fontFamily: "'DM Sans', system-ui",
              fontWeight: 300,
              textTransform: "uppercase",
            }}>
              {config.customLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
