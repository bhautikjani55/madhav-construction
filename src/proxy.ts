import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    // Already logged in? Don't show the login form again.
    if (pathname === "/login") {
      const user = await verifySession(req.cookies.get("mc_session")?.value);
      if (user) {
        const next = req.nextUrl.searchParams.get("next") || "/";
        return NextResponse.redirect(new URL(next, req.url));
      }
    }
    return NextResponse.next();
  }

  const user = await verifySession(req.cookies.get("mc_session")?.value);

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    // Show the login screen directly for any protected page.
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
