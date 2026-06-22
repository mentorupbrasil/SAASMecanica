import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const normalizedEmail = email.toLowerCase().trim();

          const users = await prisma.user.findMany({
            where: { email: normalizedEmail, active: true },
            include: { tenant: true },
          });

          if (users.length === 0) return null;

          let match: (typeof users)[0] | undefined;

          for (const user of users) {
            if (!user.tenant.active) continue;
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (valid) {
              match = user;
              break;
            }
          }

          if (!match) return null;

          await prisma.user.update({
            where: { id: match.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: match.id,
            email: match.email,
            name: match.name,
            role: match.role,
            tenantId: match.tenant.id,
            tenantName: match.tenant.name,
            tenantSlug: match.tenant.slug,
          };
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],
});
