import { PHProvider } from "./providers";
import { Suspense } from "react";
import PostHogPageView from "./PostHogPageView";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PHProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PHProvider>
      </body>
    </html>
  )
}
