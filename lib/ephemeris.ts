// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EARTH MOVES â€” THE EPHEMERIS ENGINE
// Zero-dependency article system for Next.js App Router
// Reads .md files from content/ephemeris/, parses frontmatter + markdown,
// generates Schema.org JSON-LD, Open Graph, RSS, and sitemap data.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import fs from "fs";
import path from "path";

// â”€â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ephemeriscolumn =
  | "sol-report"
  | "space-weather"
  | "natural-time"
  | "instrument-notes"
  | "field-notes";

export interface ArticleMeta {
  title: string;
  slug: string;
  date: string;           // ISO date: "2026-03-15"
  updated?: string;        // ISO date of last update (AEO freshness signal)
  author: string;
  column: ephemeriscolumn;
  description: string;     // 150-160 chars â€” used for meta + OG + AI citation
  keywords: string[];      // primary keyword first, then secondaries
  instrument?: "watch" | "calendar" | "none";
  image?: string;          // path relative to /public, e.g. "/ephemeris/perihelion.jpg"
  imageAlt?: string;
  imageCredit?: string;    // "NASA/JPL" or "ESA/Hubble" etc.
  draft?: boolean;         // true = hidden from index + sitemap
  faq?: { q: string; a: string }[];  // FAQ pairs for Schema.org FAQPage markup
}

export interface Article {
  meta: ArticleMeta;
  content: string;         // raw markdown
  html: string;            // rendered HTML
  readingTime: number;     // minutes
  wordCount: number;
}

// â”€â”€â”€ COLUMN DISPLAY DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const COLUMNS: Record<ephemeriscolumn, { label: string; description: string; color: string }> = {
  "sol-report":       { label: "Sol Report",       description: "Monthly orbit briefing â€” what's happening in Earth's journey this month", color: "#C9A96E" },
  "space-weather":    { label: "Space Weather",    description: "Solar storms, aurora forecasts, and live conditions from NOAA SWPC",      color: "#60A5FA" },
  "natural-time":     { label: "Natural Time",     description: "Essays on reconnecting with astronomical rhythms",                       color: "#6BCB77" },
  "instrument-notes": { label: "Instrument Notes", description: "Technical deep-dives into how the Watch and Calendar work",              color: "#E0A040" },
  "field-notes":      { label: "Field Notes",      description: "Observations, photography, and reports from the field",                  color: "#C084FC" },
};

// â”€â”€â”€ CONTENT DIRECTORY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CONTENT_DIR = path.join(process.cwd(), "content", "ephemeris");

// â”€â”€â”€ FRONTMATTER PARSER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Parses YAML-like frontmatter between --- delimiters. No js-yaml needed.

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const yaml = match[1];
  const content = match[2];
  const meta: Record<string, unknown> = {};

  let currentKey = "";
  let inArray = false;
  let arrayValues: string[] = [];
  let inFaqArray = false;
  let faqItems: { q: string; a: string }[] = [];
  let currentFaq: { q: string; a: string } = { q: "", a: "" };

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();

    // FAQ array handling
    if (inFaqArray) {
      if (trimmed.startsWith("- q:")) {
        if (currentFaq.q) faqItems.push({ ...currentFaq });
        currentFaq = { q: trimmed.slice(5).trim().replace(/^["']|["']$/g, ""), a: "" };
        continue;
      }
      if (trimmed.startsWith("a:")) {
        currentFaq.a = trimmed.slice(2).trim().replace(/^["']|["']$/g, "");
        continue;
      }
      if (!trimmed.startsWith("-") && !trimmed.startsWith("a:") && trimmed.includes(":")) {
        if (currentFaq.q) faqItems.push({ ...currentFaq });
        meta.faq = faqItems;
        inFaqArray = false;
        // fall through to normal parsing
      } else {
        continue;
      }
    }

    // Array continuation
    if (inArray && trimmed.startsWith("-")) {
      arrayValues.push(trimmed.slice(1).trim().replace(/^["']|["']$/g, ""));
      continue;
    } else if (inArray) {
      meta[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }

    // Key: value parsing
    const kvMatch = trimmed.match(/^(\w+)\s*:\s*(.*)$/);
    if (kvMatch) {
      const [, key, rawVal] = kvMatch;
      const val = rawVal.trim();

      if (key === "faq" && val === "") {
        inFaqArray = true;
        faqItems = [];
        currentFaq = { q: "", a: "" };
        currentKey = key;
        continue;
      }

      if (val === "" || val === "[]") {
        // Start of array or empty
        currentKey = key;
        inArray = true;
        arrayValues = [];
        continue;
      }

      // Inline array: [a, b, c]
      if (val.startsWith("[") && val.endsWith("]")) {
        meta[key] = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
        continue;
      }

      // Boolean
      if (val === "true") { meta[key] = true; continue; }
      if (val === "false") { meta[key] = false; continue; }

      // String (strip quotes)
      meta[key] = val.replace(/^["']|["']$/g, "");
      currentKey = key;
    }
  }

  // Flush final states
  if (inArray) meta[currentKey] = arrayValues;
  if (inFaqArray) {
    if (currentFaq.q) faqItems.push({ ...currentFaq });
    meta.faq = faqItems;
  }

  return { meta, content };
}

// â”€â”€â”€ MARKDOWN â†’ HTML RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Minimal renderer covering: headings, paragraphs, bold, italic, links,
// images, blockquotes, ordered/unordered lists, horizontal rules, code.
// No external library needed. Handles the 95% case for editorial content.

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let inParagraph = false;

  const inline = (text: string): string => {
    return text
      // Images: ![alt](src)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" class="eph-img" />')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Bold: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      // Italic: *text* or _text_
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
      .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>")
      // Inline code: `code`
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Superscript: ^text^
      .replace(/\^([^^]+)\^/g, "<sup>$1</sup>")
      // Subscript: ~text~
      .replace(/~([^~]+)~/g, "<sub>$1</sub>");
  };

  const closeParagraph = () => {
    if (inParagraph) { out.push("</p>"); inParagraph = false; }
  };
  const closeList = () => {
    if (inList) { out.push(inList === "ul" ? "</ul>" : "</ol>"); inList = null; }
  };
  const closeBlockquote = () => {
    if (inBlockquote) { out.push("</blockquote>"); inBlockquote = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      closeParagraph();
      closeList();
      closeBlockquote();
      continue;
    }

    // Pipe table detection: line starts and ends with | and next line is separator
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Look ahead to see if this is a table (need at least header + separator)
      const tableLines: string[] = [trimmed];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith("|") && lines[j].trim().endsWith("|")) {
        tableLines.push(lines[j].trim());
        j++;
      }
      if (tableLines.length >= 2 && tableLines[1].match(/^\|[\s\-:|]+\|$/)) {
        closeParagraph(); closeList(); closeBlockquote();
        // Parse header
        const headerCells = tableLines[0].split("|").slice(1, -1).map(c => c.trim());
        // Parse alignment from separator row
        const sepCells = tableLines[1].split("|").slice(1, -1).map(c => c.trim());
        const aligns = sepCells.map(c => {
          if (c.startsWith(":") && c.endsWith(":")) return "center";
          if (c.endsWith(":")) return "right";
          return "left";
        });
        // Build table HTML
        out.push('<table class="eph-table">');
        out.push("<thead><tr>");
        headerCells.forEach((cell, ci) => {
          out.push(`<th style="text-align:${aligns[ci] || "left"}">${inline(cell)}</th>`);
        });
        out.push("</tr></thead>");
        out.push("<tbody>");
        for (let r = 2; r < tableLines.length; r++) {
          const cells = tableLines[r].split("|").slice(1, -1).map(c => c.trim());
          out.push("<tr>");
          cells.forEach((cell, ci) => {
            out.push(`<td style="text-align:${aligns[ci] || "left"}">${inline(cell)}</td>`);
          });
          out.push("</tr>");
        }
        out.push("</tbody></table>");
        i = j - 1; // skip processed lines
        continue;
      }
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeParagraph(); closeList(); closeBlockquote();
      out.push('<hr class="eph-hr" />');
      continue;
    }

    // Headings
    const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      closeParagraph(); closeList(); closeBlockquote();
      const level = hMatch[1].length;
      const id = hMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${level} id="${id}" class="eph-h${level}">${inline(hMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      closeParagraph(); closeList();
      if (!inBlockquote) { out.push('<blockquote class="eph-quote">'); inBlockquote = true; }
      out.push(`<p>${inline(trimmed.slice(1).trim())}</p>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      closeParagraph(); closeBlockquote();
      if (inList !== "ul") { closeList(); out.push('<ul class="eph-ul">'); inList = "ul"; }
      out.push(`<li>${inline(trimmed.slice(2).trim())}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^(\d+)\.\s(.+)$/);
    if (olMatch) {
      closeParagraph(); closeBlockquote();
      if (inList !== "ol") { closeList(); out.push('<ol class="eph-ol">'); inList = "ol"; }
      out.push(`<li>${inline(olMatch[2])}</li>`);
      continue;
    }

    // Special: instrument embed marker
    if (trimmed === "{{watch-embed}}" || trimmed === "{{calendar-embed}}") {
      closeParagraph(); closeList(); closeBlockquote();
      const which = trimmed.includes("watch") ? "watch" : "calendar";
      out.push(`<div class="eph-instrument-embed" data-instrument="${which}"></div>`);
      continue;
    }

    // Special: image with credit {{image:path|alt|credit}}
    const imgMatch = trimmed.match(/^\{\{image:(.+?)\|(.+?)\|(.+?)\}\}$/);
    if (imgMatch) {
      closeParagraph(); closeList(); closeBlockquote();
      out.push(`<figure class="eph-figure"><img src="${imgMatch[1]}" alt="${imgMatch[2]}" loading="lazy" class="eph-img" /><figcaption>${imgMatch[3]}</figcaption></figure>`);
      continue;
    }

    // Paragraph
    closeList(); closeBlockquote();
    if (!inParagraph) { out.push('<p class="eph-p">'); inParagraph = true; }
    else { out.push(" "); }
    out.push(inline(trimmed));
  }

  closeParagraph(); closeList(); closeBlockquote();
  return out.join("\n");
}

// â”€â”€â”€ READING TIME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function calcReadingTime(text: string): { minutes: number; words: number } {
  const words = text.replace(/[#*>\-_\[\](){}|`]/g, " ").split(/\s+/).filter(Boolean).length;
  return { minutes: Math.max(1, Math.ceil(words / 230)), words };
}

// â”€â”€â”€ LOAD SINGLE ARTICLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getArticle(slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta: rawMeta, content } = parseFrontmatter(raw);
  const { minutes, words } = calcReadingTime(content);
  const html = renderMarkdown(content);

  const meta: ArticleMeta = {
    title: (rawMeta.title as string) || slug,
    slug: (rawMeta.slug as string) || slug,
    date: (rawMeta.date as string) || new Date().toISOString().slice(0, 10),
    updated: rawMeta.updated as string | undefined,
    author: (rawMeta.author as string) || "Earth Moves",
    column: (rawMeta.column as ephemeriscolumn) || "natural-time",
    description: (rawMeta.description as string) || "",
    keywords: (rawMeta.keywords as string[]) || [],
    instrument: (rawMeta.instrument as ArticleMeta["instrument"]) || "none",
    image: rawMeta.image as string | undefined,
    imageAlt: rawMeta.imageAlt as string | undefined,
    imageCredit: rawMeta.imageCredit as string | undefined,
    draft: (rawMeta.draft as boolean) || false,
    faq: Array.isArray(rawMeta.faq)
      ? (rawMeta.faq as { q: string; a: string }[]).filter((f): f is { q: string; a: string } => f != null && typeof f === "object" && !!f.q && !!f.a)
      : undefined,
  };

  return { meta, content, html, readingTime: minutes, wordCount: words };
}

// â”€â”€â”€ LOAD ALL ARTICLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getAllArticles(includeDrafts = false): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const articles: Article[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const article = getArticle(slug);
    if (article && (includeDrafts || !article.meta.draft)) {
      articles.push(article);
    }
  }

  // Sort by date descending (newest first)
  articles.sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  return articles;
}

// â”€â”€â”€ GET ARTICLES BY COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getArticlesByColumn(column: ephemeriscolumn): Article[] {
  return getAllArticles().filter((a) => a.meta.column === column);
}

// â”€â”€â”€ RELATED ARTICLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getRelatedArticles(current: Article, max = 3): Article[] {
  const all = getAllArticles().filter((a) => a.meta.slug !== current.meta.slug);

  // Score by: same column (3pts), shared keywords (1pt each)
  const scored = all.map((a) => {
    let score = 0;
    if (a.meta.column === current.meta.column) score += 3;
    for (const kw of current.meta.keywords) {
      if (a.meta.keywords.includes(kw)) score += 1;
    }
    return { article: a, score };
  });

  scored.sort((a, b) => b.score - a.score || b.article.meta.date.localeCompare(a.article.meta.date));
  return scored.slice(0, max).map((s) => s.article);
}

// â”€â”€â”€ SCHEMA.ORG JSON-LD GENERATORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generateArticleSchema(article: Article, baseUrl: string): object {
  const url = `${baseUrl}/ephemeris/${article.meta.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.meta.title,
    description: article.meta.description,
    image: article.meta.image ? `${baseUrl}${article.meta.image}` : undefined,
    datePublished: article.meta.date,
    dateModified: article.meta.updated || article.meta.date,
    author: {
      "@type": "Organization",
      name: "Earth Moves",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Earth Moves",
      url: baseUrl,
      logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    wordCount: article.wordCount,
    keywords: article.meta.keywords.join(", "),
  };
}

export function generateFaqSchema(faq: { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function generateBreadcrumbSchema(article: Article, baseUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "The Ephemeris", item: `${baseUrl}/ephemeris` },
      { "@type": "ListItem", position: 3, name: article.meta.title, item: `${baseUrl}/ephemeris/${article.meta.slug}` },
    ],
  };
}

// â”€â”€â”€ RSS FEED GENERATOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generateRSS(articles: Article[], baseUrl: string): string {
  const items = articles.slice(0, 30).map((a) => `
    <item>
      <title><![CDATA[${a.meta.title}]]></title>
      <link>${baseUrl}/ephemeris/${a.meta.slug}</link>
      <guid isPermaLink="true">${baseUrl}/ephemeris/${a.meta.slug}</guid>
      <pubDate>${new Date(a.meta.date).toUTCString()}</pubDate>
      <description><![CDATA[${a.meta.description}]]></description>
      <category>${COLUMNS[a.meta.column]?.label || a.meta.column}</category>
      <author>editorial@earthmoves.space (Earth Moves)</author>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Ephemeris â€” Earth Moves</title>
    <link>${baseUrl}/ephemeris</link>
    <description>Astronomical briefings, orbital insights, and natural time philosophy from Earth Moves.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/ephemeris/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>The Ephemeris â€” Earth Moves</title>
      <link>${baseUrl}/ephemeris</link>
    </image>
    ${items}
  </channel>
</rss>`;
}

// â”€â”€â”€ SITEMAP ENTRIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generateSitemapEntries(baseUrl: string): string {
  const articles = getAllArticles();
  const entries = articles.map((a) => `
  <url>
    <loc>${baseUrl}/ephemeris/${a.meta.slug}</loc>
    <lastmod>${a.meta.updated || a.meta.date}</lastmod>
    <changefreq>${a.meta.column === "sol-report" ? "monthly" : "yearly"}</changefreq>
    <priority>0.7</priority>
  </url>`);

  // Add the index page
  entries.unshift(`
  <url>
    <loc>${baseUrl}/ephemeris</loc>
    <lastmod>${articles[0]?.meta.date || new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

  return entries.join("");
}
