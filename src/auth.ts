import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type UserRole =
  | "OWNER"
  | "MANAGER"
  | "ADVISOR"
  | "MECHANIC"
  | "STOCK"
  | "FINANCE"
  | "RECEPTION";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      tenantId: string;
      tenantName: string;
      tenantSlug: string;
    };
  }

  interface User {
    role: UserRole;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
  }
}

const loginSchema = z.object({
  slug: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        slug: { label: "Oficina", type: "text" },
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { slug, email, password } = parsed.data;

        const tenant = await prisma.tenant.findUnique({
          where: { slug: slug.toLowerCase().trim() },
        });
        if (!tenant || !tenant.active) return null;

        const user = await prisma.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: tenant.id,
              email: email.toLowerCase().trim(),
            },
          },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantSlug: tenant.slug,
        };
      },
    }),
  ],
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
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.tenantName = token.tenantName;
      session.user.tenantSlug = token.tenantSlug;
      return session;
    },
  },
});
