"use client";

import { useState, useEffect } from "react";

// ─── CITY POOL (same as watch page LP array) ─────────────────────────
const CITY_POOL = [
  { name: "London",       lat: 51.5074,  lon: -0.1278  },
  { name: "Houston",      lat: 29.7604,  lon: -95.3584 },
  { name: "Shanghai",     lat: 31.2304,  lon: 121.4737 },
  { name: "New York",     lat: 40.7128,  lon: -74.006  },
  { name: "Tokyo",        lat: 35.6762,  lon: 139.6503 },
  { name: "Sydney",       lat: -33.8688, lon: 151.2093 },
  { name: "Oslo",         lat: 59.9139,  lon: 10.7522  },
  { name: "Dubai",        lat: 25.2048,  lon: 55.2708  },
  { name: "São Paulo",    lat: -23.5505, lon: -46.6333 },
  { name: "Mumbai",       lat: 19.076,   lon: 72.8777  },
  { name: "Singapore",    lat: 1.3521,   lon: 103.8198 },
  { name: "Los Angeles",  lat: 34.0522,  lon: -118.2437},
  { name: "Paris",        lat: 48.8566,  lon: 2.3522   },
  { name: "Berlin",       lat: 52.52,    lon: 13.405   },
  { name: "Kyiv",         lat: 50.4501,  lon: 30.5234  },
  { name: "Cape Town",    lat: -33.9249, lon: 18.4241  },
  { name: "Beijing",      lat: 39.9042,  lon: 116.4074 },
  { name: "Mexico City",  lat: 19.4326,  lon: -99.1332 },
  { name: "Cairo",        lat: 30.0444,  lon: 31.2357  },
  { name: "Amsterdam",    lat: 52.3676,  lon: 4.9041   },
  { name: "Stockholm",    lat: 59.3293,  lon: 18.0686  },
  { name: "Reykjavík",    lat: 64.1466,  lon: -21.9426 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  { name: "Nairobi",      lat: -1.2921,  lon: 36.8219  },
];

// ─── TYPES ────────────────────────────────────────────────────────────
interface Pin { name: string; lat: number; lon: number; }
interface DisplayConfig {
  customLabel: string;
  accentColor: string;
  cloudsOn: boolean;
  southPole: boolean;
  skinName: string;
  locationPins: Pin[];
}
type Configs = Record<string, DisplayConfig>;

// ─── STYLES ───────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh", background: "#050810",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#d0daf0", padding: "0",
  } as React.CSSProperties,
  gate: {
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", justifyContent: "center",
    minHeight: "100vh", gap: "20px",
  },
  input: {
    background: "rgba(14,20,40,.9)", border: "1px solid rgba(80,110,170,.3)",
    borderRadius: "8px", color: "#d0daf0", padding: "10px 16px",
    fontSize: "14px", outline: "none", width: "280px",
    fontFamily: "inherit",
  } as React.CSSProperties,
  btn: (accent = false) => ({
    background: accent ? "rgba(80,130,220,.18)" : "rgba(20,28,50,.8)",
    border: `1px solid ${accent ? "rgba(80,150,255,.4)" : "rgba(60,80,130,.25)"}`,
    borderRadius: "8px", color: accent ? "#a0c8ff" : "#8090b0",
    padding: "8px 20px", cursor: "pointer", fontSize: "12px",
    letterSpacing: ".6px", fontFamily: "inherit",
    transition: "all .2s",
  } as React.CSSProperties),
  card: {
    background: "rgba(10,15,30,.7)", border: "1px solid rgba(50,70,120,.2)",
    borderRadius: "12px", padding: "20px 24px", marginBottom: "12px",
  } as React.CSSProperties,
  label: {
    fontSize: "10px", color: "rgba(100,120,170,.6)",
    textTransform: "uppercase" as const, letterSpacing: "1.5px",
    display: "block", marginBottom: "6px",
  },
  field: {
    background: "rgba(14,20,40,.9)", border: "1px solid rgba(60,80,130,.25)",
    borderRadius: "6px", color: "#d0daf0", padding: "8px 12px",
    fontSize: "13px", outline: "none", width: "100%",
    fontFamily: "inherit", boxSizing: "border-box" as const,
  } as React.CSSProperties,
  toggle: (on: boolean) => ({
    width: "40px", height: "22px", borderRadius: "11px", cursor: "pointer",
    background: on ? "rgba(80,180,100,.4)" : "rgba(40,50,80,.5)",
    border: `1px solid ${on ? "rgba(80,200,100,.4)" : "rgba(60,80,120,.3)"}`,
    position: "relative" as const, transition: "all .25s", flexShrink: 0,
  }),
  dot: (on: boolean) => ({
    position: "absolute" as const, top: "3px",
    left: on ? "20px" : "3px", width: "14px", height: "14px",
    borderRadius: "50%", background: on ? "#6bcb77" : "#4a5a7a",
    transition: "all .25s",
  }),
  tagBtn: (active: boolean) => ({
    padding: "3px 9px", borderRadius: "4px", cursor: "pointer",
    fontSize: "10px", fontFamily: "inherit",
    background: active ? "rgba(80,130,220,.22)" : "rgba(20,28,50,.6)",
    border: `1px solid ${active ? "rgba(80,150,255,.4)" : "rgba(50,70,110,.2)"}`,
    color: active ? "#a0c8ff" : "#5a6a8a",
  } as React.CSSProperties),
};

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwErr, setPwErr] = useState(false);

  const [configs, setConfigs] = useState<Configs>({});
  const [loading, setLoading] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editState, setEditState] = useState<DisplayConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Fetch configs on auth
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/display-config")
      .then(r => r.json())
      .then(data => { setConfigs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authed]);

  function login() {
    if (password === "earthmoves2026") {
      setAuthed(true); setPwErr(false);
    } else {
      setPwErr(true);
    }
  }

  function startEdit(slug: string) {
    setEditSlug(slug);
    setEditState(JSON.parse(JSON.stringify(configs[slug])));
    setSaveMsg("");
  }

  function cancelEdit() { setEditSlug(null); setEditState(null); }

  async function saveEdit() {
    if (!editSlug || !editState) return;
    setSaving(true);
    setSaveMsg("");
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
      } else {
        setSaveMsg("Error saving");
      }
    } catch {
      setSaveMsg("Error saving");
    }
    setSaving(false);
  }

  function togglePin(city: Pin) {
    if (!editState) return;
    const existing = editState.locationPins.findIndex(p => p.name === city.name);
    if (existing >= 0) {
      setEditState({ ...editState, locationPins: editState.locationPins.filter(p => p.name !== city.name) });
    } else {
      setEditState({ ...editState, locationPins: [...editState.locationPins, city] });
    }
  }

  // ── Password gate ──────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={S.page}>
        <div style={S.gate}>
          <div style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "3px", color: "#8090c0", textTransform: "uppercase", marginBottom: "8px" }}>
            Earth Moves Admin
          </div>
          <div style={{ fontSize: "11px", color: "rgba(80,100,150,.6)", letterSpacing: "1.5px", marginBottom: "24px" }}>
            Display Configuration
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwErr(false); }}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ ...S.input, borderColor: pwErr ? "rgba(200,80,80,.5)" : "rgba(80,110,170,.3)" }}
            autoFocus
          />
          {pwErr && (
            <div style={{ fontSize: "11px", color: "rgba(220,100,100,.8)", letterSpacing: ".5px" }}>
              Incorrect password
            </div>
          )}
          <button onClick={login} style={S.btn(true)}>Enter</button>
        </div>
      </div>
    );
  }

  // ── Main dashboard ─────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(50,70,120,.2)", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 300, letterSpacing: "2px", color: "#a0b0d0" }}>
            Earth Moves — Display Admin
          </div>
          <div style={{ fontSize: "11px", color: "rgba(80,100,150,.5)", letterSpacing: "1px", marginTop: "2px" }}>
            Manage airport &amp; institution displays
          </div>
        </div>
        <button onClick={() => setAuthed(false)} style={S.btn()}>Log out</button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        {loading && (
          <div style={{ textAlign: "center", color: "rgba(100,120,170,.5)", padding: "40px", fontSize: "13px" }}>
            Loading configurations…
          </div>
        )}

        {!loading && Object.keys(configs).map(slug => {
          const cfg = configs[slug];
          const isEditing = editSlug === slug;

          return (
            <div key={slug} style={S.card}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isEditing ? "20px" : "0" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: cfg.accentColor, boxShadow: `0 0 6px ${cfg.accentColor}`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: "15px", color: "#c0d0f0", fontWeight: 400 }}>
                      {cfg.customLabel}
                    </span>
                  </div>
                  <div style={{ marginTop: "4px", paddingLeft: "20px", fontSize: "11px", color: "rgba(80,100,150,.55)", fontFamily: "'DM Mono', monospace", letterSpacing: ".5px" }}>
                    /display/{slug} · {cfg.locationPins.length} pins · {cfg.skinName} skin · clouds {cfg.cloudsOn ? "on" : "off"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={`/display/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...S.btn(), textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}
                  >
                    ↗ Preview
                  </a>
                  {!isEditing
                    ? <button onClick={() => startEdit(slug)} style={S.btn(true)}>Edit</button>
                    : <button onClick={cancelEdit} style={S.btn()}>Cancel</button>
                  }
                </div>
              </div>

              {/* Edit form */}
              {isEditing && editState && (
                <div style={{ borderTop: "1px solid rgba(50,70,120,.18)", paddingTop: "20px" }}>

                  {/* Custom label */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={S.label}>Display Label</label>
                    <input
                      type="text"
                      value={editState.customLabel}
                      onChange={e => setEditState({ ...editState, customLabel: e.target.value })}
                      style={S.field}
                    />
                  </div>

                  {/* Accent color */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={S.label}>Accent Color</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="color"
                        value={editState.accentColor}
                        onChange={e => setEditState({ ...editState, accentColor: e.target.value })}
                        style={{ width: "44px", height: "34px", borderRadius: "6px", border: "1px solid rgba(60,80,130,.3)", cursor: "pointer", background: "none", padding: "2px" }}
                      />
                      <input
                        type="text"
                        value={editState.accentColor}
                        onChange={e => setEditState({ ...editState, accentColor: e.target.value })}
                        style={{ ...S.field, width: "120px" }}
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Skin */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={S.label}>Earth Skin</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["default", "silver", "ice"].map(skin => (
                        <button
                          key={skin}
                          onClick={() => setEditState({ ...editState, skinName: skin })}
                          style={S.tagBtn(editState.skinName === skin)}
                        >
                          {skin.charAt(0).toUpperCase() + skin.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles row */}
                  <div style={{ display: "flex", gap: "32px", marginBottom: "20px" }}>
                    {/* Clouds */}
                    <div>
                      <label style={S.label}>Clouds</label>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                        onClick={() => setEditState({ ...editState, cloudsOn: !editState.cloudsOn })}
                      >
                        <div style={S.toggle(editState.cloudsOn)}>
                          <div style={S.dot(editState.cloudsOn)} />
                        </div>
                        <span style={{ fontSize: "12px", color: editState.cloudsOn ? "#6bcb77" : "#4a5a7a" }}>
                          {editState.cloudsOn ? "On" : "Off"}
                        </span>
                      </div>
                    </div>
                    {/* South Pole */}
                    <div>
                      <label style={S.label}>Perspective</label>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                        onClick={() => setEditState({ ...editState, southPole: !editState.southPole })}
                      >
                        <div style={S.toggle(editState.southPole)}>
                          <div style={S.dot(editState.southPole)} />
                        </div>
                        <span style={{ fontSize: "12px", color: editState.southPole ? "#6bcb77" : "#4a5a7a" }}>
                          {editState.southPole ? "South Pole" : "North Pole"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location pins */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={S.label}>
                      Location Pins ({editState.locationPins.length} selected)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {CITY_POOL.map(city => {
                        const active = editState.locationPins.some(p => p.name === city.name);
                        return (
                          <button
                            key={city.name}
                            onClick={() => togglePin(city)}
                            style={S.tagBtn(active)}
                          >
                            {city.name}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "10px", color: "rgba(70,90,130,.4)", letterSpacing: ".5px" }}>
                      Click to add or remove cities
                    </div>
                  </div>

                  {/* Save row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(50,70,120,.15)", paddingTop: "16px" }}>
                    <button onClick={saveEdit} disabled={saving} style={S.btn(true)}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={cancelEdit} style={S.btn()}>Cancel</button>
                    {saveMsg && (
                      <span style={{ fontSize: "12px", color: saveMsg.startsWith("Error") ? "#e06060" : "#6bcb77", letterSpacing: ".5px" }}>
                        {saveMsg}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!loading && Object.keys(configs).length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(80,100,150,.4)", padding: "60px 20px", fontSize: "13px" }}>
            No display configurations found.
          </div>
        )}
      </div>
    </div>
  );
}
