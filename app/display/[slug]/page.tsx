import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DisplayClient from "./DisplayClient";
import rawConfigs from "@/lib/display-configs.json";

type Configs = Record<string, {
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
}>;

const configs = rawConfigs as Configs;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const cfg = configs[slug];
  return {
    title: cfg?.customLabel ?? "Earth Moves Display",
    description: "Live orbital display — Earth Moves",
  };
}

export default async function DisplayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = configs[slug];
  if (!config) notFound();
  return <DisplayClient config={config} />;
}
