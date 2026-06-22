export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export async function uniqueSlug(baseName: string, exists: (slug: string) => Promise<boolean>) {
  let slug = slugify(baseName) || "oficina";
  if (!(await exists(slug))) return slug;

  for (let i = 2; i < 100; i++) {
    const candidate = `${slugify(baseName).slice(0, 24)}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }

  return `${slug}-${Date.now().toString(36).slice(-4)}`;
}
