"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import "../earth-moves.css";

// ─── TYPES ────────────────────────────────────────────────────────────

interface ArticleOrder {
  id: string;
  topic: string;
  notes?: string;
  status: string;
  error?: string;
  slug?: string;
  createdAt: string;
  completedAt?: string;
  plan?: string;
  draft?: string;
  final?: string;
  images?: { description: string; source: string }[];
}

const STAGE_LABELS: Record<string, { label: string; color: string; grok: string }> = {
  queued:      { label: "Queued",           color: "#555",    grok: "" },
  planning:    { label: "GROK 1→2 Planning", color: "#E0A040", grok: "Commissioner + Architect" },
  writing:     { label: "GROK 3 Writing",    color: "#60A5FA", grok: "The Writer" },
  imaging:     { label: "GROK 4 Generating",  color: "#C084FC", grok: "Image Director" },
  "editing-1": { label: "GROK 5 Fact-check", color: "#6BCB77", grok: "Precision Editor" },
  "editing-2": { label: "GROK 6 Voice",      color: "#6BCB77", grok: "Voice Editor" },
  "editing-3": { label: "GROK 7 Final",      color: "#6BCB77", grok: "Final Proof" },
  publishing:  { label: "Publishing",        color: "#C9A96E", grok: "" },
  done:        { label: "Published",         color: "#6BCB77", grok: "" },
  error:       { label: "Error",             color: "#E06060", grok: "" },
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function AIDashboard() {
  const [apiKey, setApiKey] = useState("");
  const [autoPublish, setAutoPublish] = useState(true);
  const [ordersText, setOrdersText] = useState("");
  const [orders, setOrders] = useState<ArticleOrder[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("em_grok_key");
    if (saved) setApiKey(saved);
  }, []);

  // Poll for status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/pipeline");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 3000);
    return () => clearInterval(iv);
  }, [fetchStatus]);

  // Save API key
  const saveKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") localStorage.setItem("em_grok_key", key);
  };

  // Submit orders
  const submitOrders = async () => {
    if (!apiKey || !ordersText.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/ai/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordersText, apiKey, autoPublish }),
      });
      setOrdersText("");
      fetchStatus();
    } catch {}
    setSubmitting(false);
  };

  // Clear completed
  const clearDone = async () => {
    await fetch("/api/ai/pipeline", { method: "DELETE" });
    fetchStatus();
  };

  const activeCount = orders.filter((o) => !["done", "error", "queued"].includes(o.status)).length;
  const doneCount = orders.filter((o) => o.status === "done").length;

  if (!mounted) return null;

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <Link href="/" style={S.navLogo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="10" strokeDasharray="4 3" opacity=".4" />
          </svg>
          Earth Moves
        </Link>
        <div style={S.navLinks}>
          <Link href="/ephemeris" style={S.navLink}>Ephemeris</Link>
          <span style={{ ...S.navLink, color: "#C9A96E" }}>AI Pipeline</span>
        </div>
      </nav>

      <main style={S.main}>
        {/* Header */}
        <header style={S.header}>
          <div style={S.headerTag}>Ephemeris AI Pipeline</div>
          <h1 style={S.h1}>The Seven Groks</h1>
          <p style={S.headerSub}>
            Commission → Plan → Write → Image → Fact-check → Voice → Proof → Publish
          </p>
        </header>

        {/* Pipeline visual */}
        <div style={S.pipelineBar}>
          {["G1","G2","G3","G4","G5","G6","G7"].map((g, i) => {
            const names = ["Commissioner","Architect","Writer","Image Dir","Precision","Voice","Proof"];
            const colors = ["#E0A040","#E0A040","#60A5FA","#C084FC","#6BCB77","#6BCB77","#6BCB77"];
            const active = activeCount > 0;
            return (
              <div key={g} style={S.pipelineNode}>
                <div style={{
                  ...S.pipelineCircle,
                  background: active ? colors[i] + "25" : "rgba(30,40,70,.5)",
                  borderColor: active ? colors[i] + "60" : "rgba(60,80,130,.3)",
                  color: active ? colors[i] : "rgba(100,130,180,.4)",
                }}>
                  {g}
                </div>
                <span style={{ ...S.pipelineLabel, color: active ? "rgba(200,220,255,.7)" : "rgba(80,110,160,.4)" }}>
                  {names[i]}
                </span>
              </div>
            );
          })}
        </div>

        <div style={S.grid}>
          {/* Left column — Controls */}
          <div style={S.panel}>
            {/* API Key */}
            <div style={S.section}>
              <label style={S.label}>Grok API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
                placeholder="xai-..."
                style={S.input}
              />
              <p style={S.hint}>Get yours at console.x.ai — stored locally only</p>
            </div>

            {/* Auto-publish toggle */}
            <div style={{ ...S.section, ...S.row }}>
              <span style={S.label}>Auto-publish</span>
              <button
                onClick={() => setAutoPublish(!autoPublish)}
                style={{
                  ...S.toggle,
                  background: autoPublish ? "rgba(107,203,119,.25)" : "rgba(30,40,70,.5)",
                  borderColor: autoPublish ? "rgba(107,203,119,.5)" : "rgba(60,80,130,.3)",
                }}
              >
                <div style={{
                  ...S.toggleThumb,
                  left: autoPublish ? 18 : 3,
                  background: autoPublish ? "#6BCB77" : "rgba(100,130,180,.5)",
                }} />
              </button>
            </div>

            {/* Orders input */}
            <div style={S.section}>
              <label style={S.label}>Article Orders</label>
              <p style={S.hint}>One topic per block. Separate with -- on its own line. Add notes below each topic.</p>
              <textarea
                value={ordersText}
                onChange={(e) => setOrdersText(e.target.value)}
                placeholder={`Perseid Meteor Shower 2027 Complete Guide
Peak dates, best viewing times, connection to Swift-Tuttle debris
--
Why the Moon Always Shows the Same Face
Tidal locking explained through Earth Moves philosophy
--
Aurora Forecast: Understanding the Kp Index`}
                style={S.textarea}
                rows={10}
              />
              <button
                onClick={submitOrders}
                disabled={submitting || !apiKey || !ordersText.trim()}
                style={{
                  ...S.btn,
                  opacity: submitting || !apiKey || !ordersText.trim() ? 0.4 : 1,
                }}
              >
                {submitting ? "Submitting..." : `Send to Pipeline${ordersText.trim() ? ` (${ordersText.split(/\n--\n|\n---\n/).filter(Boolean).length})` : ""}`}
              </button>
            </div>

            {/* Stats */}
            <div style={S.statsRow}>
              <div style={S.stat}>
                <span style={S.statNum}>{orders.length}</span>
                <span style={S.statLabel}>Total</span>
              </div>
              <div style={S.stat}>
                <span style={{ ...S.statNum, color: "#60A5FA" }}>{activeCount}</span>
                <span style={S.statLabel}>Active</span>
              </div>
              <div style={S.stat}>
                <span style={{ ...S.statNum, color: "#6BCB77" }}>{doneCount}</span>
                <span style={S.statLabel}>Done</span>
              </div>
            </div>
          </div>

          {/* Right column — Order status */}
          <div style={S.panel}>
            <div style={{ ...S.row, marginBottom: 16 }}>
              <span style={S.label}>Pipeline Queue</span>
              {doneCount > 0 && (
                <button onClick={clearDone} style={S.clearBtn}>Clear completed</button>
              )}
            </div>

            {orders.length === 0 && (
              <p style={{ color: "rgba(80,110,160,.5)", fontSize: 13, textAlign: "center", padding: "3rem 0" }}>
                No orders yet. Write topics on the left and send them through the pipeline.
              </p>
            )}

            {[...orders].reverse().map((order) => {
              const stage = STAGE_LABELS[order.status] || STAGE_LABELS.queued;
              const expanded = expandedId === order.id;
              return (
                <div key={order.id} style={S.orderCard}>
                  <div
                    style={S.orderHeader}
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.orderTopic}>{order.topic}</div>
                      <div style={S.orderMeta}>
                        {new Date(order.createdAt).toLocaleTimeString()}
                        {stage.grok && <span style={{ marginLeft: 8, color: "rgba(160,180,220,.45)" }}>→ {stage.grok}</span>}
                      </div>
                    </div>
                    <div style={{
                      ...S.statusBadge,
                      background: stage.color + "20",
                      borderColor: stage.color + "50",
                      color: stage.color,
                    }}>
                      {order.status === "done" || order.status === "error" ? "" : "● "}
                      {stage.label}
                    </div>
                  </div>

                  {expanded && (
                    <div style={S.orderExpanded}>
                      {order.error && <p style={{ color: "#E06060", fontSize: 12 }}>Error: {order.error}</p>}
                      {order.slug && order.status === "done" && (
                        <Link href={`/ephemeris/${order.slug}`} style={S.viewLink}>
                          View published article →
                        </Link>
                      )}
                      {order.images && order.images.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <span style={S.expandLabel}>Generated images ({order.images.length}):</span>
                          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" as const }}>
                            {order.images.map((img: { localPath?: string; position?: string; alt?: string; prompt?: string; description?: string; source?: string }, i: number) => (
                              <div key={i} style={{ borderRadius: 6, border: "1px solid rgba(60,80,130,.25)", overflow: "hidden", width: 140 }}>
                                {img.localPath && (
                                  <img src={img.localPath} alt={img.alt || ""} style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
                                )}
                                <div style={{ padding: "4px 6px" }}>
                                  <div style={{ fontSize: 9, color: "rgba(192,132,252,.7)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>{img.position || "image"}</div>
                                  <div style={{ fontSize: 9, color: "rgba(160,180,220,.4)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{img.prompt || img.description || ""}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {order.final && (
                        <details style={{ marginTop: 8 }}>
                          <summary style={S.expandLabel}>Final article preview</summary>
                          <pre style={S.preview}>{order.final.slice(0, 800)}...</pre>
                        </details>
                      )}
                      {order.draft && !order.final && (
                        <details style={{ marginTop: 8 }}>
                          <summary style={S.expandLabel}>Draft preview</summary>
                          <pre style={S.preview}>{order.draft.slice(0, 500)}...</pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grok instance reference */}
        <section style={S.refSection}>
          <h2 style={S.refTitle}>The Seven Instances</h2>
          <div style={S.refGrid}>
            {[
              { id: "G1", name: "The Commissioner", role: "Receives raw topic, produces structured brief with title, slug, column, keywords, SEO description", color: "#E0A040" },
              { id: "G2", name: "The Architect", role: "Designs structure: word count, H2 sections, image positions, FAQ pairs, formatting elements, instrument connections", color: "#E0A040" },
              { id: "G3", name: "The Writer", role: "Master voice of Earth Moves. Curious, precise, meditative. Writes citation-ready first paragraphs. Connects cosmos to human experience", color: "#60A5FA" },
              { id: "G4", name: "Image Director", role: "Refines image prompts and GENERATES images via grok-imagine-image ($0.20 each). Downloads to /public/ephemeris/. 3 retries per image. Deep void black aesthetic", color: "#C084FC" },
              { id: "G5", name: "Precision Editor", role: "Verifies every number, date, distance, speed, period. Silently corrects errors. Checks unit consistency", color: "#6BCB77" },
              { id: "G6", name: "Voice Editor", role: "Kills corporate-blog voice. Enforces rhythmic variation. Ensures the Earth Moves tone: meditative observatory director", color: "#6BCB77" },
              { id: "G7", name: "Final Proof", role: "Grammar, markdown formatting, heading hierarchy, structure compliance, word count verification, publish/review flag", color: "#6BCB77" },
            ].map((g) => (
              <div key={g.id} style={S.refCard}>
                <div style={{ ...S.refId, color: g.color }}>{g.id}</div>
                <div style={S.refName}>{g.name}</div>
                <p style={S.refRole}>{g.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#060A13",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "rgba(200,220,255,.88)",
  },
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 clamp(1rem, 3vw, 3rem)",
    background: "rgba(6,10,19,.92)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(201,169,110,.12)",
  },
  navLogo: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600,
    letterSpacing: ".12em", color: "#C9A96E", textDecoration: "none",
    display: "flex", alignItems: "center", gap: ".6rem",
  },
  navLinks: { display: "flex", gap: "1rem", alignItems: "center" },
  navLink: {
    fontSize: ".78rem", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" as const,
    color: "rgba(232,236,244,.5)", textDecoration: "none",
  },
  main: {
    maxWidth: 1200, margin: "0 auto",
    padding: "88px clamp(1rem, 3vw, 2.5rem) 4rem",
  },
  header: { textAlign: "center" as const, marginBottom: "2.5rem" },
  headerTag: {
    fontSize: ".65rem", letterSpacing: ".2em", textTransform: "uppercase" as const,
    color: "rgba(201,169,110,.6)", marginBottom: ".5rem",
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
    fontWeight: 300, color: "rgba(232,236,244,.95)", margin: "0 0 .5rem",
  },
  headerSub: { fontSize: ".85rem", color: "rgba(160,180,220,.5)", letterSpacing: ".03em" },

  // Pipeline visual
  pipelineBar: {
    display: "flex", justifyContent: "center", gap: "clamp(.5rem, 2vw, 1.5rem)",
    marginBottom: "2.5rem", flexWrap: "wrap" as const,
  },
  pipelineNode: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 },
  pipelineCircle: {
    width: 42, height: 42, borderRadius: "50%", border: "1.5px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace",
    transition: "all .3s",
  },
  pipelineLabel: { fontSize: 9, letterSpacing: ".04em", textAlign: "center" as const },

  // Layout
  grid: {
    display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem",
    alignItems: "start",
  },
  panel: {
    background: "rgba(15,22,42,.5)", border: "1px solid rgba(201,169,110,.1)",
    borderRadius: 14, padding: "1.5rem",
  },
  section: { marginBottom: "1.25rem" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between" },

  // Form elements
  label: {
    fontSize: ".65rem", letterSpacing: ".15em", textTransform: "uppercase" as const,
    color: "rgba(160,180,220,.55)", display: "block", marginBottom: 6,
  },
  input: {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    background: "rgba(10,16,32,.8)", border: "1px solid rgba(60,80,130,.3)",
    color: "rgba(200,220,255,.88)", fontSize: 13,
    fontFamily: "'DM Mono', monospace", outline: "none",
  },
  textarea: {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    background: "rgba(10,16,32,.8)", border: "1px solid rgba(60,80,130,.3)",
    color: "rgba(200,220,255,.88)", fontSize: 13, lineHeight: 1.6,
    fontFamily: "'DM Sans', system-ui", outline: "none", resize: "vertical" as const,
  },
  hint: { fontSize: 10, color: "rgba(80,110,160,.45)", marginTop: 4 },
  btn: {
    width: "100%", padding: "10px", marginTop: 10, borderRadius: 8,
    background: "rgba(201,169,110,.18)", border: "1px solid rgba(201,169,110,.35)",
    color: "#E8D5A8", fontSize: 12, fontWeight: 600, letterSpacing: ".06em",
    textTransform: "uppercase" as const, cursor: "pointer",
    fontFamily: "'DM Sans', system-ui",
  },
  toggle: {
    width: 38, height: 20, borderRadius: 10, border: "1px solid",
    position: "relative" as const, cursor: "pointer", background: "none", padding: 0,
  },
  toggleThumb: {
    position: "absolute" as const, top: 3, width: 13, height: 13,
    borderRadius: "50%", transition: "left .2s, background .2s",
  },

  // Stats
  statsRow: {
    display: "flex", gap: "1rem", justifyContent: "center",
    padding: "1rem 0 0", borderTop: "1px solid rgba(60,80,130,.2)", marginTop: "1rem",
  },
  stat: { textAlign: "center" as const },
  statNum: {
    display: "block", fontSize: 22, fontWeight: 300,
    fontFamily: "'Cormorant Garamond', serif", color: "rgba(200,220,255,.8)",
  },
  statLabel: { fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "rgba(80,110,160,.45)" },

  // Orders list
  orderCard: {
    border: "1px solid rgba(60,80,130,.2)", borderRadius: 10,
    marginBottom: 8, overflow: "hidden", transition: "border-color .2s",
  },
  orderHeader: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 14px", cursor: "pointer",
  },
  orderTopic: {
    fontSize: 13, color: "rgba(200,220,255,.82)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
  },
  orderMeta: { fontSize: 10, color: "rgba(80,110,160,.4)", fontFamily: "'DM Mono', monospace", marginTop: 2 },
  statusBadge: {
    fontSize: 9, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" as const,
    padding: "3px 10px", borderRadius: 6, border: "1px solid", whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  orderExpanded: { padding: "0 14px 12px" },
  expandLabel: {
    fontSize: 10, color: "rgba(160,180,220,.5)", letterSpacing: ".08em",
    textTransform: "uppercase" as const, cursor: "pointer",
  },
  imageRow: { fontSize: 11, marginTop: 4 },
  preview: {
    fontSize: 11, color: "rgba(160,180,220,.5)", marginTop: 8,
    padding: 10, background: "rgba(10,16,32,.6)", borderRadius: 6,
    overflow: "auto", maxHeight: 200, whiteSpace: "pre-wrap" as const,
    fontFamily: "'DM Mono', monospace", lineHeight: 1.5,
  },
  viewLink: {
    fontSize: 12, color: "#C9A96E", textDecoration: "none", fontWeight: 500,
    display: "inline-block", marginTop: 4,
  },
  clearBtn: {
    background: "none", border: "1px solid rgba(224,96,96,.25)",
    borderRadius: 6, color: "rgba(224,96,96,.6)", fontSize: 10,
    padding: "3px 10px", cursor: "pointer", fontFamily: "'DM Sans', system-ui",
  },

  // Reference section
  refSection: { marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(201,169,110,.1)" },
  refTitle: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 300,
    color: "rgba(200,220,255,.8)", margin: "0 0 1.5rem", textAlign: "center" as const,
  },
  refGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem",
  },
  refCard: {
    padding: "1rem", borderRadius: 10, border: "1px solid rgba(60,80,130,.2)",
    background: "rgba(15,22,42,.3)",
  },
  refId: {
    fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
    letterSpacing: ".08em", marginBottom: 4,
  },
  refName: { fontSize: 13, fontWeight: 500, color: "rgba(200,220,255,.82)", marginBottom: 6 },
  refRole: { fontSize: 11, color: "rgba(160,180,220,.5)", lineHeight: 1.5, margin: 0 },
};

// Responsive override
if (typeof window !== "undefined" && window.innerWidth < 768) {
  S.grid = { ...S.grid, gridTemplateColumns: "1fr" };
}
