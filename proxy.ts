import { NextResponse, type NextRequest } from "next/server";

// Optimistic cookie-only guard (per Next 16 guidance). Real authorization
// happens in Server Components / Actions / Route Handlers.
function hasSessionCookies(req: NextRequest) {
  return req.cookies.getAll().some((c) => c.name.startsWith("sb-"));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!hasSessionCookies(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/reports/:path*", "/admin/:path*"],
};
