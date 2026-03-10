#!/usr/bin/env node

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EARTH MOVES â€” EPHEMERIS ARTICLE GENERATOR
// 
// Usage:
//   npx ts-node scripts/create-article.ts
//   npx ts-node scripts/create-article.ts --title "Perseid Meteor Shower 2027"
//   npx ts-node scripts/create-article.ts --from-brief briefs/perseids.json
//
// This script can be used in two modes:
//   1. Interactive â€” prompts for title, column, keywords, etc.
//   2. From brief â€” reads a JSON brief file (designed for AI batch generation)
//
// The brief JSON format is also what you feed to Claude/GPT to generate
// complete articles. See BRIEF_TEMPLATE below.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import fs from "fs";
import path from "path";
import readline from "readline";

// â”€â”€â”€ BRIEF TEMPLATE (for AI generation) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BRIEF_TEMPLATE = {
  // Required
  title: "",
  slug: "",               // lowercase-hyphenated, no special chars
  column: "",             // sol-report | space-weather | natural-time | instrument-notes | field-notes
  description: "",        // 150-160 chars â€” THE most important field for SEO + AEO
  keywords: [],           // primary keyword first, then 3-5 secondaries
  
  // Content guidance
  primaryQuestion: "",    // The main question this article answers (for AEO)
  angle: "",              // What makes this article unique vs Wikipedia
  instrument: "",         // watch | calendar | none â€” which instrument to link
  
  // Optional enrichment
  faq: [],                // Array of {q, a} pairs for Schema.org FAQ markup
  imageSearch: "",        // Suggested image search term (for sourcing)
  
  // Auto-generated (don't fill these)
  date: "",               // Will be set to today
  author: "Earth Moves",
};

// â”€â”€â”€ AI SYSTEM PROMPT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Use this as the system prompt when generating articles with Claude/GPT

export const AI_SYSTEM_PROMPT = `You are the editorial voice of Earth Moves â€” a project that reconnects 
humanity with astronomical time. Your tone is meditative yet precise, 
grounded in science but reaching toward philosophy. You write like a 
thoughtful observatory director: clear, authoritative, occasionally poetic, 
never academic or dry.

VOICE RULES:
- Write as "Earth Moves" (the project), not as a person
- Use "we" sparingly â€” prefer direct statements about Earth, the Sun, the Moon
- Never use "you might be surprised to learn" or similar clickbait phrasing
- Numbers are sacred: every figure must be astronomically accurate
- Link concepts back to what the Watch or Calendar instrument shows
- End with a connection to the lived experience of being on Earth

STRUCTURE FOR AEO + SEO:
- First paragraph: Direct answer to the primary question (this is what AI will cite)
- Second paragraph: Context and significance
- H2 headings for major sections (3-5 per article)
- One "The numbers" section with key data points
- FAQ section with 3-5 Q&A pairs (these become Schema.org FAQ markup)
- 1500-3000 words per article

TERMINOLOGY:
- Use "Sol" for a day (when being astronomical), "day" in casual context
- Use "FyrtÃ¥rn" (lighthouse) for the 8 orbital anchors
- Use "natural time" vs "industrial time" (Brage's framework)
- Refer to instruments as "the Watch" and "the Calendar" (capitalised)

FORBIDDEN:
- No "In this article we will explore..."
- No "Let's dive into..."  
- No "Have you ever wondered..."
- No hedging ("might", "perhaps", "arguably") on established science
- No emojis in body text`;

// â”€â”€â”€ SLUG GENERATOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// â”€â”€â”€ GENERATE FRONTMATTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateFrontmatter(brief: typeof BRIEF_TEMPLATE): string {
  const date = new Date().toISOString().slice(0, 10);
  let fm = `---
title: "${brief.title}"
slug: ${brief.slug || toSlug(brief.title)}
date: "${date}"
updated: "${date}"
author: "${brief.author || "Earth Moves"}"
column: ${brief.column}
description: "${brief.description}"
keywords:
${brief.keywords.map((k: string) => `  - "${k}"`).join("\n")}
instrument: ${brief.instrument || "none"}`;

  if (brief.imageSearch) {
    fm += `\nimage: "/ephemeris/${brief.slug || toSlug(brief.title)}.jpg"`;
    fm += `\nimageAlt: "${brief.title}"`;
    fm += `\nimageCredit: "NASA"`;
  }

  if (brief.faq && brief.faq.length > 0) {
    fm += `\nfaq:`;
    for (const item of brief.faq as { q: string; a: string }[]) {
      fm += `\n  - q: "${item.q}"`;
      fm += `\n    a: "${item.a}"`;
    }
  }

  fm += "\n---\n";
  return fm;
}

// â”€â”€â”€ GENERATE ARTICLE PROMPT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// This generates the user prompt to send to Claude/GPT along with AI_SYSTEM_PROMPT

export function generateArticlePrompt(brief: typeof BRIEF_TEMPLATE): string {
  return `Write an article for The Ephemeris (Earth Moves editorial).

BRIEF:
- Title: ${brief.title}
- Column: ${brief.column}
- Primary question to answer: ${brief.primaryQuestion}
- Unique angle: ${brief.angle}
- Target keywords: ${brief.keywords.join(", ")}
- Instrument link: ${brief.instrument}
- Description (use as the thesis): ${brief.description}

Write the full article body in Markdown (without frontmatter â€” I will add that).
Include H2 sections, a "The numbers" section with key data, and conclude with 
a reference to the live ${brief.instrument || "Calendar"} instrument.

${brief.faq && brief.faq.length > 0 ? `\nAlso address these FAQ questions naturally within the article:\n${(brief.faq as { q: string; a: string }[]).map((f) => `- ${f.q}`).join("\n")}` : ""}`;
}

// â”€â”€â”€ CREATE ARTICLE FILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function createArticleFile(brief: typeof BRIEF_TEMPLATE, body?: string): string {
  const slug = brief.slug || toSlug(brief.title);
  const frontmatter = generateFrontmatter(brief);
  const content = body || `\n## [Section title]\n\n[Article content goes here]\n\n---\n\nSee this live on the Earth Moves ${brief.instrument === "watch" ? "Watch" : "Calendar"}.\n`;

  const filePath = path.join(process.cwd(), "content", "ephemeris", `${slug}.md`);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filePath, frontmatter + content, "utf-8");
  return filePath;
}

// â”€â”€â”€ BATCH GENERATION FROM BRIEFS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function processBriefFile(briefPath: string): void {
  const raw = fs.readFileSync(briefPath, "utf-8");
  const brief = JSON.parse(raw);

  if (Array.isArray(brief)) {
    // Multiple briefs in one file
    for (const b of brief) {
      const fp = createArticleFile(b);
      console.log(`âœ… Created: ${fp}`);
    }
  } else {
    const fp = createArticleFile(brief);
    console.log(`âœ… Created: ${fp}`);
  }
}

// â”€â”€â”€ INTERACTIVE MODE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string): Promise<string> => new Promise((res) => rl.question(q, res));

  console.log("\nâ•â•â• EARTH MOVES â€” CREATE EPHEMERIS ARTICLE â•â•â•\n");

  const title = await ask("Title: ");
  const column = await ask("Column (sol-report/space-weather/natural-time/instrument-notes/field-notes): ");
  const description = await ask("Description (150-160 chars): ");
  const keywords = (await ask("Keywords (comma-separated): ")).split(",").map((s) => s.trim());
  const instrument = await ask("Instrument (watch/calendar/none): ");
  const primaryQuestion = await ask("Primary question this answers: ");

  const brief = {
    ...BRIEF_TEMPLATE,
    title,
    slug: toSlug(title),
    column,
    description,
    keywords,
    instrument,
    primaryQuestion,
    angle: "",
    faq: [],
    imageSearch: "",
    date: new Date().toISOString().slice(0, 10),
  };

  const filePath = createArticleFile(brief);
  console.log(`\nâœ… Article stub created: ${filePath}`);
  console.log(`\nðŸ“‹ AI generation prompt copied below:\n`);
  console.log(generateArticlePrompt(brief));

  rl.close();
}

// â”€â”€â”€ MAIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const args = process.argv.slice(2);

if (args.includes("--from-brief")) {
  const idx = args.indexOf("--from-brief");
  const briefPath = args[idx + 1];
  if (!briefPath) {
    console.error("Provide a brief file path: --from-brief briefs/topic.json");
    process.exit(1);
  }
  processBriefFile(briefPath);
} else if (args.includes("--help")) {
  console.log(`
Earth Moves Ephemeris Article Creator

Usage:
  npx ts-node scripts/create-article.ts              Interactive mode
  npx ts-node scripts/create-article.ts --from-brief briefs/topic.json
  npx ts-node scripts/create-article.ts --help

Brief JSON format:
${JSON.stringify(BRIEF_TEMPLATE, null, 2)}
  `);
} else {
  interactive();
}
