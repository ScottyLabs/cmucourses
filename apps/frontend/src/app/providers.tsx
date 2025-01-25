"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
