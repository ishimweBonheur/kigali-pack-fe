import { auth } from "@/auth";
import { NextResponse } from "next/server";

const authPaths = ["/login", "/forgot-password", "/reset-password"];
const dashboardPrefix = "/dashboard";
const adminPrefix = "/admin-dashboard";

const ADMIN_ROLES = new Set([
  "MASTER_ADMIN",
  "ADMIN",
  "OWNER",
  "ORG_OWNER",
]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.redirect(
      new URL("/get-started", req.nextUrl.origin),
    );
  }

  const isAuthPage = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isDashboard =
    pathname === dashboardPrefix || pathname.startsWith(`${dashboardPrefix}/`);
  const isAdminDashboard =
    pathname === adminPrefix || pathname.startsWith(`${adminPrefix}/`);

  if (isAdminDashboard) {
    if (!isLoggedIn || !role || !ADMIN_ROLES.has(role)) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin-dashboard",
    "/admin-dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
