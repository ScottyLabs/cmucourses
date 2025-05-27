import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  // Check if this is a post-authentication redirect
  if (
    req.nextUrl.pathname === "/" &&
    req.nextUrl.searchParams.has("__clerk_status")
  ) {
    return NextResponse.redirect(
      new URL("https://www.cmucourses.com", req.url)
    );
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
