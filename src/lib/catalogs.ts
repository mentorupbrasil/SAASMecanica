export const SERVICE_CATEGORIES = [
  "Revisão geral",
  "Troca de óleo",
  "Motor e transmissão",
  "Freios",
  "Suspensão e direção",
  "Sistema elétrico",
  "Alternador e motor de partida",
  "Bateria",
  "Iluminação",
  "Injeção eletrônica / diagnóstico",
  "Ar condicionado",
  "Central multimídia / som",
  "Funilaria",
  "Alinhamento e balanceamento",
  "Pneus",
  "Outros",
] as const;

export const PRODUCT_CATEGORIES = [
  "Filtros",
  "Freios",
  "Suspensão",
  "Motor",
  "Sistema elétrico",
  "Baterias",
  "Alternador e partida",
  "Iluminação",
  "Sensores e atuadores",
  "Fusíveis e relés",
  "Chicotes e conectores",
  "Injeção eletrônica",
  "Fluidos e lubrificantes",
  "Ignição",
  "Correias",
  "Pneus",
  "Acessórios",
  "Outros",
] as const;

export const SUPPLIER_CATEGORIES = [
  "Peças automotivas",
  "Elétrica e baterias",
  "Funilaria e pintura",
  "Serviços terceirizados",
  "Pneus e rodas",
  "Injeção eletrônica",
  "Guincho e reboque",
  "Vidros",
  "Desmanche",
  "Outros",
] as const;

export const EMPLOYEE_SPECIALTIES = [
  "Mecânica geral",
  "Motor e transmissão",
  "Freios e suspensão",
  "Elétrica automotiva",
  "Injeção eletrônica",
  "Alternador e partida",
  "Bateria e carga",
  "Iluminação e chicote",
  "Ar condicionado",
  "Funilaria",
  "Pneus e alinhamento",
] as const;

export const SERVICE_PRESETS = [
  { name: "Troca de óleo + filtro", category: "Troca de óleo", price: 180, durationMin: 45, warrantyDays: 0 },
  { name: "Revisão básica 10.000 km", category: "Revisão geral", price: 350, durationMin: 120, warrantyDays: 30 },
  { name: "Alinhamento", category: "Alinhamento e balanceamento", price: 120, durationMin: 40, warrantyDays: 7 },
  { name: "Balanceamento (4 rodas)", category: "Alinhamento e balanceamento", price: 80, durationMin: 30, warrantyDays: 7 },
  { name: "Pastilhas dianteiras", category: "Freios", price: 250, durationMin: 60, warrantyDays: 90 },
  { name: "Diagnóstico OBD / scanner", category: "Injeção eletrônica / diagnóstico", price: 150, durationMin: 45, warrantyDays: 0 },
  { name: "Recarga e teste de bateria", category: "Bateria", price: 80, durationMin: 30, warrantyDays: 30 },
  { name: "Reparo alternador", category: "Alternador e motor de partida", price: 280, durationMin: 120, warrantyDays: 90 },
  { name: "Reparo motor de partida", category: "Alternador e motor de partida", price: 320, durationMin: 150, warrantyDays: 90 },
  { name: "Instalação farol / lanterna", category: "Iluminação", price: 120, durationMin: 45, warrantyDays: 30 },
  { name: "Higienização ar condicionado", category: "Ar condicionado", price: 180, durationMin: 60, warrantyDays: 30 },
  { name: "Mão de obra mecânica (hora)", category: "Motor e transmissão", price: 120, durationMin: 60, warrantyDays: 90 },
  { name: "Mão de obra elétrica (hora)", category: "Sistema elétrico", price: 130, durationMin: 60, warrantyDays: 90 },
] as const;

export const VEHICLE_CATALOG: { brand: string; models: string[] }[] = [
  { brand: "Chevrolet", models: ["Onix", "Onix Plus", "Prisma", "Tracker", "Spin", "Cruze", "S10", "Montana", "Equinox"] },
  { brand: "Volkswagen", models: ["Gol", "Polo", "Virtus", "T-Cross", "Nivus", "Jetta", "Amarok", "Saveiro", "Taos"] },
  { brand: "Fiat", models: ["Uno", "Mobi", "Argo", "Cronos", "Toro", "Strada", "Pulse", "Fastback", "Fiorino"] },
  { brand: "Hyundai", models: ["HB20", "HB20S", "Creta", "Tucson", "ix35", "Azera", "Santa Fe"] },
  { brand: "Toyota", models: ["Corolla", "Corolla Cross", "Hilux", "Yaris", "SW4", "RAV4", "Etios"] },
  { brand: "Honda", models: ["Civic", "City", "HR-V", "CR-V", "Fit", "WR-V"] },
  { brand: "Renault", models: ["Kwid", "Sandero", "Logan", "Duster", "Oroch", "Captur", "Megane"] },
  { brand: "Jeep", models: ["Renegade", "Compass", "Commander", "Wrangler"] },
  { brand: "Ford", models: ["Ka", "EcoSport", "Ranger", "Territory", "Bronco Sport", "Maverick"] },
  { brand: "Nissan", models: ["March", "Versa", "Kicks", "Frontier", "Sentra"] },
  { brand: "Peugeot", models: ["208", "2008", "3008", "Partner"] },
  { brand: "Citroën", models: ["C3", "C4 Cactus", "Aircross", "Jumpy"] },
  { brand: "Mitsubishi", models: ["L200", "Outlander", "Pajero", "ASX"] },
  { brand: "BMW", models: ["320i", "X1", "X3", "X5", "118i"] },
  { brand: "Mercedes-Benz", models: ["Classe A", "Classe C", "GLA", "GLC", "Sprinter"] },
];

export function searchVehicleModels(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: { brand: string; model: string; label: string }[] = [];

  for (const entry of VEHICLE_CATALOG) {
    for (const model of entry.models) {
      const label = `${entry.brand} ${model}`;
      if (
        model.toLowerCase().includes(q) ||
        entry.brand.toLowerCase().includes(q) ||
        label.toLowerCase().includes(q)
      ) {
        results.push({ brand: entry.brand, model, label });
      }
    }
  }

  return results.slice(0, 15);
}

export function brandsList() {
  return VEHICLE_CATALOG.map((v) => v.brand);
}

export function modelsForBrand(brand: string) {
  return VEHICLE_CATALOG.find((v) => v.brand === brand)?.models ?? [];
}
