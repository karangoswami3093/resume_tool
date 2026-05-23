import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth disabled for local testing — all routes are public
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
