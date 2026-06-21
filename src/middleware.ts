import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|aprovacao).*)"],
};
