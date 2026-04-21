"use client";

import { useEffect, useState, type ReactElement } from "react";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "./Link";

const DISMISS_KEY = "cmucourses-mechanize-banner-dismissed";
const PROMPT_KEY = "cmucourses-mechanize-banner-prompt";

const PROMPTS = [
  "Mechanize is hiring junior SWEs. $300K base + equity.",
  "Better at coding than AI? Prove it.",
  "We hire engineers to outsmart AI. It’s harder than you think. 300k + equity.",
  "Most engineers can’t beat Claude on our take-home. Think you can? 300k + equity for Jr SWEs at Mechanize.",
];
const MECHANIZE_APPLY_URL = "https://jobs.ashbyhq.com/mechanize?utm_source=CMU";

function pickPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)]!;
}

function getOrCreateSessionPrompt(): string {
  try {
    const existing = sessionStorage.getItem(PROMPT_KEY);
    if (existing) {
      return existing;
    }
  } catch {
    /* sessionStorage unavailable */
  }
  const chosen = pickPrompt();
  try {
    sessionStorage.setItem(PROMPT_KEY, chosen);
  } catch {
    /* ignore */
  }
  return chosen;
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
    setPrompt(getOrCreateSessionPrompt());
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
      sessionStorage.removeItem(PROMPT_KEY);
    } catch {
      /* ignore */
    }
    setPrompt(null);
  };

  if (prompt == null) {
    return null;
  }

  return (
    <div className="nightwind-prevent-block relative py-5 pl-10 pr-10 text-white bg-[#007fff] md:py-2 md:pl-11 md:pr-11 lg:py-1.5 lg:pl-12 lg:pr-12">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss Mechanize banner"
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden />
      </button>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center lg:text-base md:text-sm text-2xs py-1">
        <span className="leading-none">{prompt}</span>
        <Link
          href={MECHANIZE_APPLY_URL}
          openInNewTab
          className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-2 font-semibold leading-none text-[#007fff] no-underline hover:bg-gray-100 hover:no-underline"
        >
          Apply now
          <ArrowUpRightIcon className="h-[1em] w-[1em] shrink-0" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
