"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// ─── CITY POOL ────────────────────────────────────────────────────────
const CITY_POOL = [
  { name: "London",       lat: 51.5074,  lon: -0.1278   },
  { name: "Houston",      lat: 29.7604,  lon: -95.3584  },
  { name: "Shanghai",     lat: 31.2304,  lon: 121.4737  },
  { name: "New York",     lat: 40.7128,  lon: -74.006   },
  { name: "Tokyo",        lat: 35.6762,  lon: 139.6503  },
  { name: "Sydney",       lat: -33.8688, lon: 151.2093  },
  { name: "Oslo",         lat: 59.9139,  lon: 10.7522   },
  { name: "Dubai",        lat: 25.2048,  lon: 55.2708   },
  { name: "São Paulo",    lat: -23.5505, lon: -46.6333  },
  { name: "Mumbai",       lat: 19.076,   lon: 72.8777   },
  { name: "Singapore",    lat: 1.3521,   lon: 103.8198  },
  { name: "Los Angeles",  lat: 34.0522,  lon: -118.2437 },
  { name: "Paris",        lat: 48.8566,  lon: 2.3522    },
  { name: "Berlin",       lat: 52.52,    lon: 13.405    },
  { name: "Kyiv",         lat: 50.4501,  lon: 30.5234   },
  { name: "Cape Town",    lat: -33.9249, lon: 18.4241   },
  { name: "Beijing",      lat: 39.9042,  lon: 116.4074  },
  { name: "Mexico City",  lat: 19.4326,  lon: -99.1332  },
  { name: "Cairo",        lat: 30.0444,  lon: 31.2357   },
  { name: "Amsterdam",    lat: 52.3676,  lon: 4.9041    },
  { name: "Stockholm",    lat: 59.3293,  lon: 18.0686   },
  { name: "Reykjavík",    lat: 64.1466,  lon: -21.9426  },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816  },
  { name: "Nairobi",      lat: -1.2921,  lon: 36.8219   },
];

// ─── TYPES ────────────────────────────────────────────────────────────
interface Pin { name: string; lat: number; lon: number; }
interface DisplayConfig {
  customLabel: string;
  accentColor: string;
  cloudsOn: boolean;
  southPole: boolean;
  skinName: string;
  skinMode: string;
  locationPins: Pin[];
  aspectRatio: string;
  displayScale: number;
  refreshMinutes: number;
  labelVisible: boolean;
  showLogo: boolean;
  brandingLayout: string;
}
type Configs = Record<string, DisplayConfig>;

function withDefaults(cfg: Partial<DisplayConfig>): DisplayConfig {
  return {
    customLabel:    cfg.customLabel    ?? "",
    accentColor:    cfg.accentColor    ?? "#60a5fa",
    cloudsOn:       cfg.cloudsOn       ?? false,
    southPole:      cfg.southPole      ?? false,
    skinName:       cfg.skinName       ?? "default",
    skinMode:       cfg.skinMode       ?? "default",
    locationPins:   cfg.locationPins   ?? [],
    aspectRatio:    cfg.aspectRatio    ?? "auto",
    displayScale:   cfg.displayScale   ?? 1.0,
    refreshMinutes: cfg.refreshMinutes ?? 30,
    labelVisible:   cfg.labelVisible   ?? true,
    showLogo:       cfg.showLogo       ?? true,
    brandingLayout: cfg.brandingLayout ?? "logo_and_label",
  };
}

// ─── PULSING DOT ANIMATION ────────────────────────────────────────────
const pulseCSS = `
@keyframes em-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.4); }
}
@keyframes em-fadein {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.em-card { animation: em-fadein 0.4s ease both; }
.em-field:focus {
  border-color: rgba(96,165,250,.4) !important;
  box-shadow: 0 0 14px rgba(96,165,250,.07) !important;
  outline: none !important;
}
`;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────
const T = {
  gold:     "rgba(201,169,110,.75)",
  goldDim:  "rgba(201,169,110,.4)",
  blue:     "rgba(96,165,250,.9)",
  blueDim:  "rgba(96,165,250,.45)",
  text:     "#e8ecf4",
  textDim:  "rgba(148,168,210,.6)",
  border:   "rgba(255,255,255,.07)",
  borderHi: "rgba(255,255,255,.14)",
  bg:       "#030508",
  bgCard:   "rgba(8,12,24,.85)",
  bgField:  "rgba(6,10,20,.9)",
};

const sec: React.CSSProperties = {
  fontSize: "9px", color: T.gold,
  textTransform: "uppercase", letterSpacing: "2.5px",
  display: "block", marginBottom: "10px",
  fontFamily: "'DM Sans', system-ui",
};

const field: React.CSSProperties = {
  background: T.bgField,
  border: `1px solid ${T.border}`,
  borderRadius: "6px", color: T.text,
  padding: "9px 13px", fontSize: "13px",
  fontFamily: "'DM Mono', monospace",
  boxSizing: "border-box", width: "100%",
};

function TagBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: "5px", cursor: "pointer",
      fontSize: "11px", fontFamily: "'DM Sans', system-ui", letterSpacing: ".3px",
      background: active ? "rgba(80,130,220,.22)" : "rgba(12,18,36,.7)",
      border: `1px solid ${active ? "rgba(80,150,255,.4)" : T.border}`,
      color: active ? T.blue : T.textDim, transition: "all .18s",
    }}>{children}</button>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
      onClick={() => onChange(!on)}>
      <div style={{
        width: "38px", height: "20px", borderRadius: "10px",
        background: on ? "rgba(96,165,250,.25)" : "rgba(20,28,50,.6)",
        border: `1px solid ${on ? T.blueDim : T.border}`,
        position: "relative", transition: "all .22s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: "3px",
          left: on ? "19px" : "3px", width: "12px", height: "12px",
          borderRadius: "50%",
          background: on ? "#60a5fa" : "rgba(80,100,150,.6)",
          transition: "all .22s",
        }} />
      </div>
      {label && <span style={{ fontSize: "12px", color: on ? T.blue : T.textDim }}>{label}</span>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [password, setPassword]   = useState("");
  const [pwErr, setPwErr]         = useState(false);
  const [configs, setConfigs]     = useState<Configs>({});
  const [loading, setLoading]     = useState(false);
  const [editSlug, setEditSlug]   = useState<string | null>(null);
  const [editState, setEditState] = useState<DisplayConfig | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");
  const [setupOpen, setSetupOpen] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  const BASE_URL = typeof window !== "undefined"
    ? window.location.origin
    : "https://earthmoves.space";

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/display-config")
      .then(r => r.json())
      .then((data: Record<string, Partial<DisplayConfig>>) => {
        const normalized: Configs = {};
        for (const [k, v] of Object.entries(data)) normalized[k] = withDefaults(v);
        setConfigs(normalized);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authed]);

  function login() {
    if (password === "earthmoves2026") { setAuthed(true); setPwErr(false); }
    else setPwErr(true);
  }

  function startEdit(slug: string) {
    setEditSlug(slug);
    setEditState(JSON.parse(JSON.stringify(configs[slug])));
    setSaveMsg("");
  }

  function cancelEdit() { setEditSlug(null); setEditState(null); }

  async function saveEdit() {
    if (!editSlug || !editState) return;
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/display-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editSlug, config: editState }),
      });
      if (res.ok) {
        setConfigs(prev => ({ ...prev, [editSlug]: editState }));
        setSaveMsg("Saved ✓");
        setTimeout(() => setSaveMsg(""), 2500);
      } else setSaveMsg("Error saving");
    } catch { setSaveMsg("Error saving"); }
    setSaving(false);
  }

  function togglePin(city: Pin) {
    if (!editState) return;
    const has = editState.locationPins.findIndex(p => p.name === city.name);
    if (has >= 0)
      setEditState({ ...editState, locationPins: editState.locationPins.filter(p => p.name !== city.name) });
    else
      setEditState({ ...editState, locationPins: [...editState.locationPins, city] });
  }

  async function copyUrl(url: string) {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  }

  // ── Login screen ──────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "20px",
        fontFamily: "'DM Sans', system-ui",
        backgroundImage: "radial-gradient(ellipse at 50% 110%, rgba(30,70,130,.12) 0%, transparent 65%)" }}>
        <style>{pulseCSS}</style>
        <Image src="/images/em-logo-white.png" alt="Earth Moves" width={160} height={32}
          style={{ height: "28px", width: "auto", opacity: 0.85, marginBottom: "4px" }} />
        <div style={{ fontSize: "11px", color: T.gold, letterSpacing: "3px", textTransform: "uppercase" }}>
          Mission Control
        </div>
        <div style={{ height: "1px", width: "160px", background: `linear-gradient(to right, transparent, ${T.border}, transparent)` }} />
        <input
          type="password" placeholder="Access code"
          value={password}
          onChange={e => { setPassword(e.target.value); setPwErr(false); }}
          onKeyDown={e => e.key === "Enter" && login()}
          className="em-field"
          style={{ ...field, width: "260px", textAlign: "center",
            borderColor: pwErr ? "rgba(220,80,80,.45)" : T.border }}
          autoFocus
        />
        {pwErr && <div style={{ fontSize: "11px", color: "rgba(220,100,100,.8)", letterSpacing: ".5px" }}>
          Incorrect access code
        </div>}
        <button onClick={login} style={{
          background: "rgba(80,130,220,.18)", border: "1px solid rgba(80,150,255,.35)",
          borderRadius: "7px", color: T.blue, padding: "9px 28px",
          cursor: "pointer", fontSize: "12px", letterSpacing: "1px",
          fontFamily: "inherit", transition: "all .2s",
        }}>Enter</button>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "'DM Sans', system-ui",
      backgroundImage: "radial-gradient(ellipse at 50% 110%, rgba(20,55,110,.10) 0%, transparent 60%)" }}>
      <style>{pulseCSS}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "18px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(4,7,16,.6)", backdropFilter: "blur(8px)",
        position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Image src="/images/em-logo-white.png" alt="Earth Moves" width={130} height={26}
            style={{ height: "22px", width: "auto", opacity: 0.9 }} />
          <div style={{ width: "1px", height: "22px", background: T.border }} />
          <div>
            <div style={{ fontSize: "13px", color: T.text, letterSpacing: "1px", fontWeight: 300 }}>
              Display Control
            </div>
            <div style={{ fontSize: "9px", color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginTop: "1px" }}>
              Mission Control
            </div>
          </div>
        </div>
        <button onClick={() => setAuthed(false)} style={{
          background: "none", border: `1px solid ${T.border}`,
          borderRadius: "6px", color: T.textDim,
          padding: "6px 16px", cursor: "pointer",
          fontSize: "11px", letterSpacing: ".5px", fontFamily: "inherit",
        }}>Log out</button>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 24px" }}>

        {/* System status */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%",
            background: "#4ade80", animation: "em-pulse 3s ease-in-out infinite" }} />
          <span style={{ fontSize: "10px", color: T.textDim, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {Object.keys(configs).length} display{Object.keys(configs).length !== 1 ? "s" : ""} online
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: "center", color: T.textDim, padding: "60px", fontSize: "13px" }}>
            Syncing configurations…
          </div>
        )}

        {!loading && Object.keys(configs).map((slug, idx) => {
          const cfg = configs[slug];
          const isEditing = editSlug === slug;
          const displayUrl = `${BASE_URL}/display/${slug}`;
          const setupExpanded = setupOpen === slug;

          return (
            <div key={slug} className="em-card" style={{
              background: T.bgCard,
              border: `1px solid ${isEditing ? T.borderHi : T.border}`,
              borderRadius: "12px", marginBottom: "14px",
              overflow: "hidden",
              animationDelay: `${idx * 55}ms`,
              boxShadow: isEditing ? `0 0 32px rgba(96,165,250,.05)` : "none",
              transition: "border-color .2s, box-shadow .2s",
            }}>
              {/* Left accent bar */}
              <div style={{ display: "flex" }}>
                <div style={{ width: "3px", background: cfg.accentColor, flexShrink: 0, borderRadius: "12px 0 0 12px" }} />
                <div style={{ flex: 1, padding: "18px 22px" }}>

                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: isEditing ? "20px" : "0" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "7px", height: "7px", borderRadius: "50%",
                          background: cfg.accentColor,
                          boxShadow: `0 0 8px ${cfg.accentColor}`,
                          animation: "em-pulse 3s ease-in-out infinite",
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: "15px", color: T.text, fontWeight: 300, letterSpacing: ".3px" }}>
                          {cfg.customLabel}
                        </span>
                      </div>
                      <div style={{ marginTop: "5px", paddingLeft: "17px", fontSize: "10px",
                        color: T.textDim, fontFamily: "'DM Mono', monospace", letterSpacing: ".4px" }}>
                        /display/{slug} · {cfg.locationPins.length} pins · {cfg.skinName} · {cfg.refreshMinutes}m refresh
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={`/display/${slug}`} target="_blank" rel="noopener noreferrer"
                        style={{
                          background: "rgba(12,18,36,.8)", border: `1px solid ${T.border}`,
                          borderRadius: "7px", color: T.textDim,
                          padding: "7px 14px", cursor: "pointer",
                          fontSize: "11px", letterSpacing: ".4px",
                          fontFamily: "inherit", textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: "5px",
                        }}>↗ Preview</a>
                      {!isEditing
                        ? <button onClick={() => startEdit(slug)} style={{
                            background: "rgba(80,130,220,.18)", border: "1px solid rgba(80,150,255,.35)",
                            borderRadius: "7px", color: T.blue, padding: "7px 18px",
                            cursor: "pointer", fontSize: "11px", letterSpacing: ".4px", fontFamily: "inherit",
                          }}>Edit</button>
                        : <button onClick={cancelEdit} style={{
                            background: "rgba(12,18,36,.8)", border: `1px solid ${T.border}`,
                            borderRadius: "7px", color: T.textDim, padding: "7px 14px",
                            cursor: "pointer", fontSize: "11px", letterSpacing: ".4px", fontFamily: "inherit",
                          }}>Cancel</button>
                      }
                    </div>
                  </div>

                  {/* Edit form */}
                  {isEditing && editState && (
                    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "22px" }}>

                      {/* Display Label */}
                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Display Label</label>
                        <input type="text" value={editState.customLabel}
                          onChange={e => setEditState({ ...editState, customLabel: e.target.value })}
                          className="em-field" style={field} />
                      </div>

                      {/* Accent Color */}
                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Accent Color</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input type="color" value={editState.accentColor}
                            onChange={e => setEditState({ ...editState, accentColor: e.target.value })}
                            style={{ width: "40px", height: "32px", borderRadius: "5px",
                              border: `1px solid ${T.border}`, cursor: "pointer",
                              background: "none", padding: "2px" }} />
                          <input type="text" value={editState.accentColor} maxLength={7}
                            onChange={e => setEditState({ ...editState, accentColor: e.target.value })}
                            className="em-field" style={{ ...field, width: "110px" }} />
                        </div>
                      </div>

                      {/* Earth Skin */}
                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Earth Skin</label>
                        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                          {(["default", "silver", "ice", "blue"] as const).map(skin => (
                            <TagBtn key={skin} active={editState.skinName === skin}
                              onClick={() => setEditState({ ...editState, skinName: skin })}>
                              {skin === "default" ? "Classic" : skin === "ice" ? "Ice Age"
                                : skin.charAt(0).toUpperCase() + skin.slice(1)}
                            </TagBtn>
                          ))}
                        </div>
                      </div>


                      {/* Clouds + Perspective */}
                      <div style={{ display: "flex", gap: "36px", marginBottom: "18px" }}>
                        <div>
                          <label style={sec}>Clouds</label>
                          <Toggle on={editState.cloudsOn}
                            onChange={v => setEditState({ ...editState, cloudsOn: v })}
                            label={editState.cloudsOn ? "On" : "Off"} />
                        </div>
                        <div>
                          <label style={sec}>Perspective</label>
                          <Toggle on={editState.southPole}
                            onChange={v => setEditState({ ...editState, southPole: v })}
                            label={editState.southPole ? "South Pole" : "North Pole"} />
                        </div>
                      </div>

                      {/* Display Layout */}
                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Aspect Ratio</label>
                        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                          {(["auto", "1:1", "9:16", "16:9", "21:9"] as const).map(r => (
                            <TagBtn key={r} active={editState.aspectRatio === r}
                              onClick={() => setEditState({ ...editState, aspectRatio: r })}>
                              {r === "auto" ? "Auto" : r}
                            </TagBtn>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Display Scale — {Math.round((editState.displayScale ?? 1) * 100)}%</label>
                        <input type="range" min={50} max={100} step={5}
                          value={Math.round((editState.displayScale ?? 1) * 100)}
                          onChange={e => setEditState({ ...editState, displayScale: Number(e.target.value) / 100 })}
                          style={{ width: "100%", accentColor: "#60a5fa", cursor: "pointer" }} />
                      </div>

                      {/* Branding */}
                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Branding Layout</label>
                        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                          {([
                            { v: "logo_and_label", l: "Logo + Label" },
                            { v: "logo_only",      l: "Logo Only"  },
                            { v: "label_only",     l: "Label Only" },
                            { v: "none",           l: "None"       },
                          ] as const).map(opt => (
                            <TagBtn key={opt.v} active={editState.brandingLayout === opt.v}
                              onClick={() => setEditState({ ...editState, brandingLayout: opt.v })}>
                              {opt.l}
                            </TagBtn>
                          ))}
                        </div>
                      </div>

                      {/* Location Pins */}
                      <div style={{ marginBottom: "18px" }}>
                        <label style={sec}>Location Pins ({editState.locationPins.length} selected)</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {CITY_POOL.map(city => {
                            const active = editState.locationPins.some(p => p.name === city.name);
                            return (
                              <TagBtn key={city.name} active={active} onClick={() => togglePin(city)}>
                                {city.name}
                              </TagBtn>
                            );
                          })}
                        </div>
                        <div style={{ marginTop: "7px", fontSize: "10px", color: T.textDim, letterSpacing: ".4px" }}>
                          Click cities to add or remove
                        </div>
                      </div>

                      {/* Refresh Interval */}
                      <div style={{ marginBottom: "22px" }}>
                        <label style={sec}>Refresh Interval</label>
                        <div style={{ display: "flex", gap: "7px" }}>
                          {[15, 30, 60, 120].map(m => (
                            <TagBtn key={m} active={editState.refreshMinutes === m}
                              onClick={() => setEditState({ ...editState, refreshMinutes: m })}>
                              {m < 60 ? `${m}m` : `${m / 60}h`}
                            </TagBtn>
                          ))}
                        </div>
                      </div>

                      {/* Save row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px",
                        borderTop: `1px solid ${T.border}`, paddingTop: "18px" }}>
                        <button onClick={saveEdit} disabled={saving} style={{
                          background: "linear-gradient(135deg, rgba(96,165,250,.25), rgba(96,165,250,.12))",
                          border: "1px solid rgba(96,165,250,.38)", borderRadius: "7px",
                          color: "rgba(200,220,255,.9)", padding: "8px 22px",
                          cursor: "pointer", fontSize: "12px",
                          letterSpacing: ".6px", fontFamily: "inherit",
                        }}>{saving ? "Saving…" : "Save Changes"}</button>
                        <button onClick={cancelEdit} style={{
                          background: "none", border: `1px solid ${T.border}`,
                          borderRadius: "7px", color: T.textDim, padding: "8px 16px",
                          cursor: "pointer", fontSize: "12px", letterSpacing: ".6px", fontFamily: "inherit",
                        }}>Cancel</button>
                        {saveMsg && (
                          <span style={{ fontSize: "12px", letterSpacing: ".4px",
                            color: saveMsg.startsWith("Error") ? "#e06060" : "#4ade80" }}>
                            {saveMsg}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Setup Instructions (collapsible) */}
                  <div style={{ marginTop: isEditing ? "18px" : "12px", borderTop: `1px solid ${T.border}`, paddingTop: "12px" }}>
                    <button onClick={() => setSetupOpen(setupExpanded ? null : slug)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "9px", color: T.goldDim, letterSpacing: "2px",
                      textTransform: "uppercase", fontFamily: "'DM Sans', system-ui",
                      display: "flex", alignItems: "center", gap: "6px", padding: 0,
                    }}>
                      <span style={{ fontSize: "10px" }}>{setupExpanded ? "▾" : "▸"}</span>
                      Setup Instructions
                    </button>

                    {setupExpanded && (
                      <div style={{ marginTop: "14px", background: "rgba(4,8,18,.7)",
                        border: `1px solid ${T.border}`, borderRadius: "8px", padding: "16px 18px" }}>

                        {/* URL */}
                        <div style={{ marginBottom: "14px" }}>
                          <div style={{ ...sec, marginBottom: "6px" }}>Display URL</div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ ...field, flex: 1, fontSize: "11px",
                              color: T.blue, background: "rgba(2,5,14,.9)" }}>
                              {displayUrl}
                            </code>
                            <button onClick={() => copyUrl(displayUrl)} style={{
                              background: "rgba(80,130,220,.15)", border: "1px solid rgba(80,150,255,.3)",
                              borderRadius: "6px", color: copied ? "#4ade80" : T.blue,
                              padding: "8px 14px", cursor: "pointer",
                              fontSize: "11px", fontFamily: "inherit", whiteSpace: "nowrap",
                            }}>{copied ? "Copied ✓" : "Copy"}</button>
                          </div>
                        </div>

                        {/* Guide */}
                        <div style={{ ...sec, marginBottom: "8px" }}>Quick Setup Guide</div>
                        <pre style={{
                          fontSize: "10px", color: T.textDim,
                          fontFamily: "'DM Mono', monospace",
                          lineHeight: 1.7, margin: 0,
                          whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>{`1. Open the display URL on your screen device
2. Press F11 for fullscreen (or use kiosk mode)
3. Display auto-refreshes every ${cfg.refreshMinutes} minutes

RASPBERRY PI (recommended for permanent installs):
chromium-browser --kiosk --noerrdialogs \\
  --disable-infobars \\
  ${displayUrl}

SMART TV:
Open the URL in the TV's built-in browser

DIGITAL SIGNAGE (BrightSign, Screenly, Yodeck):
Use the URL as a web content source`}</pre>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {!loading && Object.keys(configs).length === 0 && (
          <div style={{ textAlign: "center", color: T.textDim, padding: "80px 20px", fontSize: "13px" }}>
            No display configurations found.
          </div>
        )}
      </div>
    </div>
  );
}
