import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "lib", "display-configs.json");

function readConfigs() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export async function GET() {
  const configs = readConfigs();
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  try {
    const { slug, config } = await req.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }
    const configs = readConfigs();
    configs[slug] = config;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(configs, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
