"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  workshopName: z.string().min(3, "Nome da oficina muito curto"),
  slug: z
    .string()
    .min(3, "Identificador muito curto")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  ownerName: z.string().min(3, "Nome inválido"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type RegisterState = {
  error?: string;
  success?: boolean;
  slug?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export async function registerWorkshop(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    workshopName: String(formData.get("workshopName") ?? ""),
    slug: String(formData.get("slug") ?? "") || slugify(String(formData.get("workshopName") ?? "")),
    ownerName: String(formData.get("ownerName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { workshopName, slug, ownerName, email, password } = parsed.data;

  const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
  if (existingTenant) {
    return { error: "Este identificador de oficina já está em uso" };
  }

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

    return { success: true, slug };
  } catch {
    return { error: "Não foi possível criar a oficina. Tente novamente." };
  }
}
