import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
        token.tenantSlug = user.tenantSlug;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as never;
      session.user.tenantId = token.tenantId as string;
      session.user.tenantName = token.tenantName as string;
      session.user.tenantSlug = token.tenantSlug as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
