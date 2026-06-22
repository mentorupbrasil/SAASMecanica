import { prisma } from "@/lib/prisma";

export type TenantBranding = {
  name: string;
  logoUrl: string | null;
  brandColor: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
};

export async function getTenantBranding(tenantId: string): Promise<TenantBranding | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      branches: { where: { isMain: true }, take: 1 },
    },
  });

  if (!tenant) return null;

  const branch = tenant.branches[0];

  return {
    name: tenant.name,
    logoUrl: tenant.logoUrl,
    brandColor: tenant.brandColor ?? "#ea580c",
    phone: tenant.phone,
    email: tenant.email,
    document: tenant.document,
    address: branch?.address ?? null,
    city: branch?.city ?? null,
    state: branch?.state ?? null,
    zipCode: branch?.zipCode ?? null,
  };
}
