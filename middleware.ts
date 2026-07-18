/**
 * Next.js Middleware — refreshes Supabase Auth session on every request
 * and enforces protected routes.
 *
 * Protected routes: /dashboard, /onboarding, /results, /plan, /care, /support, /account
 * Public routes:    /login, /auth/callback
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/results",
  "/plan",
  "/care",
  "/support",
  "/account",
];

// Max time we'll wait on Supabase before giving up. Edge Functions on Netlify
// will crash the whole site with "edge function timed out" if a request hangs,
// so this must always resolve well before that limit.
const AUTH_CHECK_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Auth check timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isLoginPage = pathname === "/login";

  // Public marketing pages (/, /contact, /blog, /api/*, etc.) don't need a
  // session at all — skip the Supabase round trip entirely so they load as
  // fast as a static page. Only protected routes and /login (which redirects
  // signed-in users away) need the auth check below.
  if (!isProtected && !isLoginPage) {
    return supabaseResponse;
  }

  let user = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session — IMPORTANT: do not use getUser() result for auth decisions,
    // use the session itself. Wrapped in a timeout so a slow/unreachable Supabase
    // project can't hang this edge function and crash the whole site.
    const { data } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_CHECK_TIMEOUT_MS
    );
    user = data.user;
  } catch (err) {
    console.error("middleware: Supabase auth check failed:", err);
    // Fail closed on protected routes (redirect to login below), fail open
    // everywhere else so a Supabase outage doesn't take down the whole site.
    if (!isProtected) {
      return supabaseResponse;
    }
  }

  // Redirect unauthenticated users trying to access protected routes
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
