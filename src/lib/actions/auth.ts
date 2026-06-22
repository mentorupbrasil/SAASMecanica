"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";

const registerSchema = z.object({
  workshopName: z.string().min(3, "Nome da oficina muito curto"),
  ownerName: z.string().min(3, "Nome inválido"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type RegisterState = {
  error?: string;
  success?: boolean;
  workshopName?: string;
};

export type LoginState = {
  error?: string;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginUser(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!process.env.AUTH_SECRET) {
    return { error: "AUTH_SECRET não configurado no servidor. Contate o suporte." };
  }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Informe e-mail e senha válidos" };
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "E-mail ou senha incorretos" };
      }
      return { error: "Erro de autenticação. Tente novamente em instantes." };
    }
    throw error;
  }

  return {};
}

export async function registerWorkshop(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    workshopName: String(formData.get("workshopName") ?? "").trim(),
    ownerName: String(formData.get("ownerName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { workshopName, ownerName, email, password } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });
  if (existingUser) {
    return { error: "Este e-mail já está cadastrado. Faça login ou use outro e-mail." };
  }

  const slug = await uniqueSlug(workshopName, async (s) => {
    const t = await prisma.tenant.findUnique({ where: { slug: s } });
    return !!t;
  });

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: workshopName,
          slug,
          email: email.toLowerCase(),
          plan: "PROFESSIONAL",
        },
      });

      await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: "Matriz",
          isMain: true,
        },
      });

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: ownerName,
          email: email.toLowerCase(),
          passwordHash,
          role: "OWNER",
        },
      });
    });

    return { success: true, workshopName };
  } catch {
    return { error: "Não foi possível criar a oficina. Tente novamente." };
  }
}
