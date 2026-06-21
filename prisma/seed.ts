import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  const passwordHash = await bcrypt.hash("demo1234", 12);

  let tenant = await prisma.tenant.findUnique({ where: { slug: "demo" } });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Oficina Demo SAASMecanica",
        slug: "demo",
        email: "contato@demo.com",
        phone: "(11) 99999-0000",
        plan: "PROFESSIONAL",
      },
    });
  }

  let branch = await prisma.branch.findFirst({
    where: { tenantId: tenant.id, isMain: true },
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: "Matriz",
        city: "São Paulo",
        state: "SP",
        isMain: true,
      },
    });
  }

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "admin@demo.com",
      },
    },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      name: "Administrador Demo",
      email: "admin@demo.com",
      passwordHash,
      role: "OWNER",
    },
  });

  let customer = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, document: "12345678901" },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        type: "INDIVIDUAL",
        name: "Carlos Mendes",
        document: "12345678901",
        phone: "(11) 98888-1111",
        whatsapp: "(11) 98888-1111",
        email: "carlos@email.com",
        city: "São Paulo",
        state: "SP",
      },
    });
  }

  const existingVehicle = await prisma.vehicle.findUnique({
    where: { tenantId_plate: { tenantId: tenant.id, plate: "ABC1D23" } },
  });

  if (!existingVehicle) {
    await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        plate: "ABC1D23",
        brand: "Volkswagen",
        model: "Gol",
        year: 2020,
        color: "Prata",
        mileage: 45000,
      },
    });
  }

  const serviceCount = await prisma.serviceCatalog.count({
    where: { tenantId: tenant.id },
  });

  if (serviceCount === 0) {
    await prisma.serviceCatalog.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: "Revisão completa",
          category: "Manutenção",
          price: 350,
          durationMin: 120,
          warrantyDays: 30,
        },
        {
          tenantId: tenant.id,
          name: "Troca de pastilhas de freio",
          category: "Freios",
          price: 280,
          durationMin: 90,
          warrantyDays: 90,
        },
        {
          tenantId: tenant.id,
          name: "Alinhamento e balanceamento",
          category: "Suspensão",
          price: 150,
          durationMin: 60,
          warrantyDays: 7,
        },
      ],
    });
  }

  const productCount = await prisma.product.count({
    where: { tenantId: tenant.id },
  });

  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          tenantId: tenant.id,
          sku: "OL-5W30",
          name: "Óleo 5W30 Sintético 1L",
          category: "Lubrificantes",
          costPrice: 28,
          salePrice: 45,
          stockQty: 24,
          minStock: 6,
        },
        {
          tenantId: tenant.id,
          sku: "PF-GOL",
          name: "Pastilha freio dianteira Gol",
          category: "Freios",
          costPrice: 85,
          salePrice: 140,
          stockQty: 8,
          minStock: 4,
        },
      ],
    });
  }

  const bayCount = await prisma.serviceBay.count({
    where: { tenantId: tenant.id },
  });

  if (bayCount === 0) {
    await prisma.serviceBay.createMany({
      data: [
        { tenantId: tenant.id, branchId: branch.id, name: "Box 1", type: "BOX" },
        { tenantId: tenant.id, branchId: branch.id, name: "Box 2", type: "BOX" },
        { tenantId: tenant.id, branchId: branch.id, name: "Elevador", type: "ELEVATOR" },
      ],
    });
  }

  const employeeCount = await prisma.employee.count({
    where: { tenantId: tenant.id },
  });

  if (employeeCount === 0) {
    await prisma.employee.createMany({
      data: [
        {
          tenantId: tenant.id,
          branchId: branch.id,
          name: "Rafael Mecânico",
          type: "MECHANIC",
          specialty: "Motor e freios",
          commissionRate: 5,
          hourlyRate: 45,
        },
        {
          tenantId: tenant.id,
          branchId: branch.id,
          name: "Ana Consultora",
          type: "ADVISOR",
          commissionRate: 3,
          hourlyRate: 0,
        },
      ],
    });
  }

  console.log("✅ Seed concluído!");
  console.log("");
  console.log("   Login demo:");
  console.log("   Identificador: demo");
  console.log("   E-mail:        admin@demo.com");
  console.log("   Senha:         demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
