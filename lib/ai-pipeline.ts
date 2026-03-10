// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EARTH MOVES â€” THE EPHEMERIS AI PIPELINE v2
// 7-stage Grok pipeline with REAL image generation via grok-imagine-image
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import fs from "fs";
import path from "path";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_IMAGE_URL = "https://api.x.ai/v1/images/generations";
const GROK_MODEL = "grok-4-1-fast-reasoning";
const GROK_IMAGE_MODEL = "grok-imagine-image";

// â”€â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface GeneratedImage {
  position: string;      // "hero" | "after-section-1" etc.
  prompt: string;        // what was sent to grok-imagine-image
  localPath: string;     // /ephemeris/slug-hero.webp
  alt: string;
  credit: string;
}

export interface ArticleOrder {
  id: string;
  topic: string;
  notes?: string;
  status: "queued" | "planning" | "writing" | "imaging" | "editing-1" | "editing-2" | "editing-3" | "publishing" | "done" | "error";
  error?: string;
  plan?: string;
  draft?: string;
  images?: GeneratedImage[];
  edit1?: string;
  edit2?: string;
  final?: string;
  slug?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PipelineConfig {
  autoPublish: boolean;
  grokApiKey: string;
}

// â”€â”€â”€ STATUS PERSISTENCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_DIR = path.join(process.cwd(), "content", "ephemeris");
const STATUS_FILE = path.join(STATUS_DIR, ".pipeline-status.json");
const PUBLIC_IMG_DIR = path.join(process.cwd(), "public", "ephemeris");

export function loadPipelineStatus(): ArticleOrder[] {
  if (!fs.existsSync(STATUS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8")); }
  catch { return []; }
}

export function savePipelineStatus(orders: ArticleOrder[]) {
  if (!fs.existsSync(STATUS_DIR)) fs.mkdirSync(STATUS_DIR, { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(orders, null, 2));
}

// â”€â”€â”€ GROK CHAT API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function callGrok(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  temperature = 0.7,
  maxTokens = 4000,
  retries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(GROK_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        if (attempt === retries) throw new Error(`Grok API ${res.status}: ${err}`);
        await sleep(2000 * attempt);
        continue;
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(2000 * attempt);
    }
  }
  throw new Error("Grok call failed after retries");
}

// â”€â”€â”€ GROK IMAGE GENERATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function generateImage(
  prompt: string,
  apiKey: string,
  aspectRatio = "16:9",
  retries = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(GROK_IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROK_IMAGE_MODEL,
          prompt,
          aspect_ratio: aspectRatio,
          n: 1,
          response_format: "url",
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`Image gen attempt ${attempt} failed: ${err}`);
        if (attempt === retries) return null;
        await sleep(3000 * attempt);
        continue;
      }
      const data = await res.json();
      const url = data?.data?.[0]?.url;
      if (!url) {
        if (attempt === retries) return null;
        await sleep(2000 * attempt);
        continue;
      }
      return url;
    } catch (e) {
      console.error(`Image gen attempt ${attempt} error:`, e);
      if (attempt === retries) return null;
      await sleep(3000 * attempt);
    }
  }
  return null;
}

async function downloadImage(url: string, savePath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(savePath, buffer);
    return true;
  } catch (e) {
    console.error("Image download failed:", e);
    return false;
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  THE SEVEN GROK INSTANCES â€” SOUL DEFINITIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const GROK1_SOUL = `You are the Commissioner of The Ephemeris, the editorial publication of Earth Moves.

ABOUT EARTH MOVES:
Earth Moves reconnects humanity with astronomical time. It has two live instruments: 
The Watch (24-hour polar projection chronometer with NASA textures, real-time day/night, 
Moon, ISS tracking, tidal ellipses, NOAA space weather) and The Calendar (orbital view 
of Earth around the Sun with zodiac constellations, planetary positions, 8 FyrtÃ¥rn anchor 
dates for solstices/equinoxes/cross-quarters).

Philosophy: industrial time (seconds, minutes, hours) disconnects us from nature. Natural 
time follows the Sun, Moon, and seasons. The project sells physical watches alongside 
digital instruments.

THE EPHEMERIS columns:
- sol-report: Monthly orbit briefings
- space-weather: Solar storms, aurora, NOAA data
- natural-time: Philosophy essays on astronomical rhythms
- instrument-notes: Technical deep-dives into Watch and Calendar
- field-notes: Observations and field reports

Receive the article order and produce a JSON object with these exact fields:
{
  "title": "SEO-optimised compelling title",
  "slug": "lowercase-hyphenated-url-safe",
  "column": "one of the 5 columns",
  "description": "150-160 char meta description that answers the primary question",
  "keywords": ["primary keyword", "secondary", "tertiary", "quaternary"],
  "primaryQuestion": "The main question this article answers",
  "instrument": "watch|calendar|none",
  "brief": "2-3 sentence editorial brief"
}
Return ONLY valid JSON. No markdown fences. No explanation.`;


const GROK2_SOUL = `You are the Architect of The Ephemeris. You design article structures.

Receive a brief and return a structural blueprint.

DECIDE:
1. WORD COUNT by column: sol-report 1800-2500, space-weather 1200-1800, 
   natural-time 2000-3000, instrument-notes 1500-2200, field-notes 1000-1500
2. SECTIONS: 3-6 H2 sections. First paragraph must directly answer the primary 
   question (for AI citation engines). Include a "The numbers" data section.
3. IMAGES: 2-4 images. The FIRST image is always position "hero" (used as the 
   article's header image in frontmatter â€” NOT placed in the article body).
   Additional images use positions "inline-1", "inline-2", "inline-3" and ARE 
   placed in the article body by the writer. Each image needs a detailed 
   visual description for AI image generation. Every image MUST have a unique 
   description â€” never request the same visual twice. Think: deep void black 
   backgrounds, astronomical subjects, Earth from space, the cosmos.
4. FAQ: 3-5 question-answer pairs for Schema.org markup.

Return ONLY this JSON:
{
  "wordCount": 2200,
  "sections": [{"h2": "Title", "angle": "What it covers", "words": 400}],
  "images": [
    {
      "position": "hero",
      "generationPrompt": "Detailed prompt for AI image generation. Include style: deep void black background, astronomical, photorealistic OR diagrammatic, Earth Moves aesthetic with sapphire blue and gold accents",
      "aspectRatio": "16:9",
      "alt": "Descriptive alt text"
    }
  ],
  "faq": [{"q": "Question", "a": "Direct 1-2 sentence answer"}],
  "instrumentConnection": "How to reference Watch/Calendar"
}`;


const GROK3_SOUL = `You are the voice of Earth Moves.

You write for The Ephemeris â€” the editorial arm of a project reconnecting humanity 
with astronomical time. You are not a blogger or journalist. You are something closer 
to a thoughtful observatory director: scientifically precise, philosophically grounded, 
occasionally poetic without being flowery.

YOUR VOICE:
- Curious. Every article starts from wonder, not obligation.
- Precise. Numbers are sacred. 30.29 km/s, not "about 30 km/s". 147.1 million km, 
  not "roughly 147 million km".
- Grounded. Connect cosmic scale to human experience. Orbital speed becomes "by the 
  time you finish this sentence, Earth has carried you 150 km."
- Confident on established science. Honest about genuine uncertainty.
- Respects both experts and newcomers. Neither should feel patronised.

STRUCTURE:
- First paragraph: DIRECTLY answer the primary question. No preamble. This is what 
  AI answer engines will cite. Make it citation-perfect.
- Body sections: Follow the Architect's blueprint.
- "The numbers" section with key data points.
- Final paragraph: Connect to human experience. Reference the relevant instrument.

TERMINOLOGY: "Sol" for astronomical day. "FyrtÃ¥rn" for 8 orbital anchors. "Natural time" 
vs "industrial time". "The Watch" and "The Calendar" (capitalised). Earth, Moon, Sun 
capitalised.

ABSOLUTELY FORBIDDEN:
"In this article we will explore..." / "Let's dive into..." / "Have you ever wondered..." / 
"Buckle up..." / "It's important to note..." / "Interestingly enough..." / "Fun fact:" / 
"Did you know?" / Any clickbait. No emojis. No hedging on established science.

IMAGES: Place {{IMAGE_SLOT:inline-1}}, {{IMAGE_SLOT:inline-2}} etc. where the Architect 
specified inline images. Do NOT place {{IMAGE_SLOT:hero}} â€” the hero image is handled 
automatically by the page template. Only use inline-1, inline-2, inline-3 for body images.
Never place the same slot marker twice.

FAQ: Do NOT write FAQ content in the article body. No "Frequently Asked Questions" heading.
No Q&A pairs in the text. The FAQ section is rendered automatically from frontmatter data 
by the page template. If you feel compelled to answer a FAQ question, weave the answer 
naturally into the relevant section â€” but never as a labelled Q&A format.

Write complete Markdown. No frontmatter. Follow the blueprint exactly.`;


const GROK4_SOUL = `You are the Image Director of The Ephemeris.

You receive image specifications from the Architect and REFINE them into perfect 
generation prompts for the grok-imagine-image model.

THE EARTH MOVES AESTHETIC:
- Deep void black backgrounds (#000000 to #060A13)
- Sapphire blue atmospheric glows
- Gold (#C9A96E) accent lighting
- Crystalline clarity â€” sharp, not soft
- Scientific precision â€” diagrams should look like observatory instruments
- No text in images (text is added by the article layout)
- No people unless specifically about human experience
- Photorealistic for astronomical subjects (Earth, Moon, Sun, stars)
- Technical/diagrammatic for orbital mechanics and instrument explanations

FOR EACH IMAGE, return enhanced prompts. Use UNIQUE descriptions for every image â€” 
never generate the same visual twice in one article. The first image (position "hero") 
uses 16:9 aspect ratio. Inline images use "4:3" or "3:2".

Return JSON:
{
  "images": [
    {
      "position": "hero",
      "prompt": "Ultra-detailed prompt 200+ chars. MUST be visually distinct from other images in this article.",
      "aspectRatio": "16:9",
      "alt": "Accessibility alt text"
    },
    {
      "position": "inline-1",
      "prompt": "Different subject/angle/composition than hero. 200+ chars.",
      "aspectRatio": "4:3",
      "alt": "Accessibility alt text"
    }
  ]
}

STYLE KEYWORDS TO USE: "deep space void black background", "astronomical photography", 
"observatory instrument aesthetic", "sapphire blue atmosphere glow", "gold accent lighting", 
"8K detail", "scientific illustration", "crystalline sharp focus".

For hero images: dramatic, wide, cinematic.
For inline images: focused, diagrammatic, explanatory.

Return ONLY the JSON.`;


const GROK5_SOUL = `You are the Precision Editor of The Ephemeris.

SOLE FOCUS: factual accuracy. Verify every claim in the article.

CHECK EVERY:
- Distance (Earth-Sun perihelion 147.1M km, aphelion 152.1M km)
- Speed (Earth orbital: 29.29-30.29 km/s)
- Date (solstices, equinoxes, meteor peaks â€” verify mentally against known values)
- Period (Moon synodic: 29.53 days, sidereal: 27.32 days)
- Tilt (Earth axial: 23.44Â°)
- Historical dates and attributions
- Names of missions, spacecraft, astronomers

IF YOU FIND AN ERROR: Fix it silently. No editor's notes.
IF AMBIGUOUS BUT NOT WRONG: Leave it.

CHECK: Units consistent (km not miles unless comparing). No contradictions within article.

OUTPUT: The complete article with corrections. Markdown. No commentary.`;


const GROK6_SOUL = `You are the Voice Editor of The Ephemeris.

SOLE FOCUS: tone, style, brand consistency. Do NOT change factual content.

THE EARTH MOVES VOICE: Meditative yet precise. Curious, not performative. Confident 
on science. Connects cosmic to human. Respects intelligence.

KILL ON SIGHT:
- "Interestingly..." "Fascinatingly..." "Remarkably..." â€” empty calories
- "It's worth noting that..." â€” just note it
- "Scientists believe..." â€” name the science or state the fact
- Passive voice where active is stronger
- Paragraphs >5 sentences. Sentences >30 words (rare exceptions for rhythm)
- Corporate-blog voice. "Dive into" "unpack" "game-changer" "cutting-edge"

ENHANCE:
- Rhythmic variation: short after long
- Concrete sensory details
- Active verbs: "Earth sprints" not "Earth is at its fastest"
- Final paragraph should resonate and reference an instrument naturally

OUTPUT: Complete article. Markdown. No commentary.`;


const GROK7_SOUL = `You are the Final Proof Editor of The Ephemeris.

The article has been fact-checked and voice-edited. You are the last eyes.

CHECK:
- Grammar, spelling (British-leaning international English, Oxford comma)
- Punctuation: em dashes no spaces (â€”), correct semicolons
- Markdown: ## headings, **bold**, *italic*, proper lists
- No orphaned sentences or incomplete paragraphs
- Smooth transitions between sections
- "The numbers" section uses consistent dash bullets
- FAQ answers are complete concise sentences
- Consistent caps: Earth, Moon, Sun, the Watch, the Calendar, FyrtÃ¥rn
- {{IMAGE_SLOT:position}} markers preserved for inline images (don't remove them)
- If you see {{IMAGE_SLOT:hero}} in the body, REMOVE it â€” the hero is handled by template
- If you see a "Frequently Asked Questions" section with Q&A pairs, REMOVE it entirely â€” 
  FAQ is rendered from frontmatter by the page template, not from body text
- Remove any duplicate images (same path appearing twice)

VERIFY STRUCTURE:
- First paragraph directly answers primary question
- 3-6 H2 sections
- "The numbers" section exists
- Final paragraph references instrument
- Word count within Â±15% of target

OUTPUT: Complete final article in Markdown.
After the article, add --- then: {"wordCount": N, "quality": "publish|needs-review"}`;


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PIPELINE EXECUTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[''""]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  // Try to find JSON object in the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  try { return JSON.parse(cleaned); } catch {}
  return {};
}

export async function runPipeline(order: ArticleOrder, config: PipelineConfig): Promise<ArticleOrder> {
  const { grokApiKey } = config;
  const orders = loadPipelineStatus();
  const idx = orders.findIndex((o) => o.id === order.id);
  const update = (patch: Partial<ArticleOrder>) => {
    Object.assign(order, patch);
    if (idx >= 0) orders[idx] = order; else orders.push(order);
    savePipelineStatus(orders);
  };

  try {
    // â•â•â• STAGE 1: COMMISSIONER â•â•â•
    update({ status: "planning" });
    const briefRaw = await callGrok(GROK1_SOUL,
      `Article order:\n${order.topic}\n\nAdditional notes: ${order.notes || "None"}`,
      grokApiKey, 0.5, 1500);

    const briefData = parseJSON(briefRaw);
    if (!briefData.title) briefData.title = order.topic;
    if (!briefData.slug) briefData.slug = toSlug(briefData.title as string);
    if (!briefData.column) briefData.column = "natural-time";
    if (!briefData.keywords) briefData.keywords = [];

    const slug = briefData.slug as string;

    // â•â•â• STAGE 2: ARCHITECT â•â•â•
    const planRaw = await callGrok(GROK2_SOUL,
      `Commissioner's brief:\n${JSON.stringify(briefData, null, 2)}`,
      grokApiKey, 0.6, 2500);

    const planData = parseJSON(planRaw);
    update({ plan: JSON.stringify(planData) });

    // â•â•â• STAGE 3: WRITER â•â•â•
    update({ status: "writing" });
    const writerPrompt = `BRIEF:\n${JSON.stringify(briefData, null, 2)}\n\nBLUEPRINT:\n${JSON.stringify(planData, null, 2)}\n\nWrite the complete article. Target ${(planData.wordCount as number) || 2000} words. Place {{IMAGE_SLOT:hero}} before the first section and {{IMAGE_SLOT:inline-N}} where images belong.`;
    const draft = await callGrok(GROK3_SOUL, writerPrompt, grokApiKey, 0.8, 8000);
    update({ draft, status: "imaging" });

    // â•â•â• STAGE 4: IMAGE DIRECTOR + GENERATION â•â•â•
    const architectImages = (planData.images as { position: string; generationPrompt?: string; aspectRatio?: string; alt?: string }[]) || [];

    // Get refined prompts from Grok 4
    const imageDirectorRaw = await callGrok(GROK4_SOUL,
      `Article: "${briefData.title}"\nSlug: ${slug}\n\nArchitect image specs:\n${JSON.stringify(architectImages, null, 2)}\n\nRefine each into a perfect generation prompt.`,
      grokApiKey, 0.5, 2000);

    const imageDirectorData = parseJSON(imageDirectorRaw);
    const imageSpecs = (imageDirectorData.images as { position: string; prompt: string; aspectRatio?: string; alt?: string; filename?: string }[]) || [];

    // Generate actual images
    const generatedImages: GeneratedImage[] = [];

    for (let i = 0; i < imageSpecs.length; i++) {
      const spec = imageSpecs[i];
      const aspect = spec.aspectRatio || (i === 0 ? "16:9" : "4:3");
      const posName = (spec.position || `img`).replace(/[^a-z0-9-]/gi, "");
      const filename = `${slug}-${posName}-${i}.webp`;
      const localPath = `/ephemeris/${filename}`;
      const savePath = path.join(PUBLIC_IMG_DIR, filename);

      // Generate image (3 retries built into generateImage)
      const imageUrl = await generateImage(spec.prompt, grokApiKey, aspect);

      if (imageUrl) {
        const downloaded = await downloadImage(imageUrl, savePath);
        if (downloaded) {
          generatedImages.push({
            position: spec.position,
            prompt: spec.prompt,
            localPath,
            alt: spec.alt || (briefData.title as string),
            credit: "Generated by Earth Moves AI",
          });
          console.log(`âœ… Image saved: ${savePath}`);
        } else {
          console.warn(`âš  Image download failed for ${spec.position}, retrying with simpler prompt...`);
          // Retry with simplified prompt
          const retryUrl = await generateImage(
            `${(briefData.title as string)}, deep space void black background, astronomical, 8K detail`,
            grokApiKey, aspect
          );
          if (retryUrl) {
            const retryDownloaded = await downloadImage(retryUrl, savePath);
            if (retryDownloaded) {
              generatedImages.push({
                position: spec.position,
                prompt: "Simplified retry prompt",
                localPath,
                alt: spec.alt || (briefData.title as string),
                credit: "Generated by Earth Moves AI",
              });
            }
          }
        }
      } else {
        console.warn(`âš  Image generation failed for ${spec.position} after all retries`);
      }

      // Rate limit courtesy â€” wait between image generations
      await sleep(1500);
    }

    update({ images: generatedImages });

    // Patch image slots in the draft
    let patchedDraft = draft;
    for (const img of generatedImages) {
      // Replace {{IMAGE_SLOT:position}} with actual image markdown
      const slotPattern = new RegExp(`\\{\\{IMAGE_SLOT:${img.position}\\}\\}`, "gi");
      patchedDraft = patchedDraft.replace(
        slotPattern,
        `{{image:${img.localPath}|${img.alt}|${img.credit}}}`
      );
    }
    // Clean up any remaining unmatched slots
    patchedDraft = patchedDraft.replace(/\{\{IMAGE_SLOT:[^}]+\}\}/gi, "");

    // Strip any FAQ section the Writer may have included in body
    // (FAQ is rendered from frontmatter by the page template)
    patchedDraft = patchedDraft.replace(/## Frequently Asked Questions[\s\S]*?(?=\n## |\n---|\Z)/gi, "");
    patchedDraft = patchedDraft.replace(/## FAQ[\s\S]*?(?=\n## |\n---|\Z)/gi, "");

    // â•â•â• STAGE 5: PRECISION EDITOR â•â•â•
    update({ status: "editing-1" });
    const edit1 = await callGrok(GROK5_SOUL,
      `Verify all facts:\n\n${patchedDraft}`, grokApiKey, 0.3, 8000);
    update({ edit1 });

    // â•â•â• STAGE 6: VOICE EDITOR â•â•â•
    update({ status: "editing-2" });
    const edit2 = await callGrok(GROK6_SOUL,
      `Polish voice and tone:\n\n${edit1}`, grokApiKey, 0.6, 8000);
    update({ edit2 });

    // â•â•â• STAGE 7: FINAL PROOF â•â•â•
    update({ status: "editing-3" });
    const finalRaw = await callGrok(GROK7_SOUL,
      `Final proof:\n\n${edit2}`, grokApiKey, 0.3, 8000);

    // Split article from status JSON
    const splitIdx = finalRaw.lastIndexOf("\n---\n");
    const finalArticle = splitIdx > 0 ? finalRaw.slice(0, splitIdx).trim() : finalRaw.trim();
    update({ final: finalArticle });

    // â•â•â• PUBLISH â•â•â•
    if (config.autoPublish) {
      update({ status: "publishing" });
      const date = new Date().toISOString().slice(0, 10);

      // Build frontmatter
      const faqItems = ((planData.faq as { q: string; a: string }[]) || []).filter(f => f && f.q && f.a);
      const faqYaml = faqItems
        .map((f) => `  - q: "${(f.q || "").replace(/"/g, '\\"')}"\n    a: "${(f.a || "").replace(/"/g, '\\"')}"`)
        .join("\n");

      // Hero image for frontmatter
      const heroImg = generatedImages.find(i => i.position === "hero") || generatedImages[0];

      let frontmatter = `---
title: "${((briefData.title as string) || order.topic).replace(/"/g, '\\"')}"
slug: ${slug}
date: "${date}"
updated: "${date}"
author: "Earth Moves"
column: ${(briefData.column as string) || "natural-time"}
description: "${((briefData.description as string) || "").replace(/"/g, '\\"')}"
keywords:
${((briefData.keywords as string[]) || []).map((k) => `  - "${k}"`).join("\n")}
instrument: ${(briefData.instrument as string) || "none"}`;

      if (heroImg) {
        frontmatter += `\nimage: "${heroImg.localPath}"`;
        frontmatter += `\nimageAlt: "${heroImg.alt.replace(/"/g, '\\"')}"`;
        frontmatter += `\nimageCredit: "${heroImg.credit}"`;
      }

      if (faqYaml) {
        frontmatter += `\nfaq:\n${faqYaml}`;
      }

      frontmatter += "\n---\n\n";

      const filePath = path.join(process.cwd(), "content", "ephemeris", `${slug}.md`);
      fs.writeFileSync(filePath, frontmatter + finalArticle, "utf-8");
      console.log(`âœ… Published: ${filePath}`);

      update({ status: "done", slug, completedAt: new Date().toISOString() });
    } else {
      update({ status: "done", slug, completedAt: new Date().toISOString() });
    }

    return order;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    update({ status: "error", error: msg });
    return order;
  }
}

// â”€â”€â”€ PARSE ORDERS FILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function parseOrdersFromText(text: string): { topic: string; notes?: string }[] {
  return text
    .split(/\n--\n|\n---\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      return {
        topic: lines[0].trim(),
        notes: lines.slice(1).join("\n").trim() || undefined,
      };
    });
}
