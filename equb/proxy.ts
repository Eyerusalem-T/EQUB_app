import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE, sessionKey } from "@/lib/secret";

/** Layer 1: a cheap gate before the page runs. It proves a validly signed, unexpired session exists. */
export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (token) {
    try { await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] }); return NextResponse.next(); } catch { /* fall through */ }
  }
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  url.search = "?next=" + encodeURIComponent(req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/groups/:path*"] };
