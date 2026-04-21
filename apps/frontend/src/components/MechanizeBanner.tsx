"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "./Link";

const PROMPTS = [
  "Mechanize is hiring junior SWEs. $300K base + equity.",
  "Better at coding than AI? Prove it.",
  "We hire engineers to outsmart AI. It’s harder than you think. 300k + equity.",
  "Most engineers can’t beat Claude on our take-home. Think you can? 300k + equity for Jr SWEs at Mechanize.",
];
const MECHANIZE_APPLY_URL = "";

function pickPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)]!;
}

export default function MechanizeBanner(): ReactElement | null {
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(pickPrompt());
  }, []);

  if (prompt == null) {
    return null;
  }

  return (
    <div className="lg:p-1.5 md:p-2 p-3 lg:text-lg md:text-base text-xs text-white text-center bg-[#007fff]">
      <span>{prompt} </span>
      <Link
        href={MECHANIZE_APPLY_URL}
        openInNewTab
        className="font-semibold text-white underline decoration-white/80 hover:no-underline"
      >
        Apply now
      </Link>
    </div>
  );
}
