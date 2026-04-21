"use client";

import { useEffect, useState, type ReactElement } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Link from "./Link";

const DISMISS_KEY = "cmucourses-mechanize-banner-dismissed";

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
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        return;
      }
    } catch {
      /* sessionStorage unavailable (e.g. private mode restrictions) */
    }
    setPrompt(pickPrompt());
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setPrompt(null);
  };

  if (prompt == null) {
    return null;
  }

  return (
    <div className="nightwind-prevent-block relative lg:p-1.5 md:p-2 p-3 lg:pr-12 md:pr-11 pr-10 lg:text-lg md:text-base text-xs text-white text-center bg-[#007fff]">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss Mechanize banner"
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden />
      </button>
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
