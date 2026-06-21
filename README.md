# SAASMecanica

SaaS completo para gestão de oficinas mecânicas — inspirado nos melhores sistemas do mercado (AutoPro, Tekmetric, Shop-Ware, Oficina.app).

## Stack

- **Next.js 16** (App Router + TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **Tailwind CSS 4**
- **Recharts** (painel gerencial)

## Módulos

| Área | Funcionalidades |
|------|-----------------|
| Cadastros | Clientes, veículos, funcionários, fornecedores, serviços, peças |
| OS | Diagnóstico, fotos, assinatura, horas, WhatsApp |
| Orçamentos | Aprovação digital, conversão automática em OS |
| Estoque | Entrada/saída, inventário, alertas, NF-e |
| Financeiro | Contas, fluxo de caixa, comissões, conciliação |
| Agenda | Boxes, mecânicos, confirmação WhatsApp |
| Garantias | Peças, serviços, vencimentos, acionamentos |
| Relatórios | Faturamento, lucro, produtividade |

## Diferenciais extras (além da sua lista)

- Multi-tenant SaaS com **filiais**
- **Kanban** de produção em tempo real
- **Inspeção digital multiponto (DVI)** com fotos
- **Portal do cliente** (aprovação e acompanhamento)
- **CRM** pós-venda e campanhas WhatsApp
- **Programa de fidelidade**
- **Matriz de precificação** (margem peças/mão de obra)
- **Lembretes automáticos** de revisão (km/tempo)
- **RBAC** + auditoria de ações
- Hooks para **NFS-e/NF-e**, PIX e conciliação bancária

## Como rodar

```bash
# Instalar dependências
npm install

# Configurar .env (copie .env.example e cole a connection string do Neon)
# DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
# AUTH_SECRET=... (openssl rand -base64 32)

# Gerar client Prisma + sincronizar banco Neon
npm run db:generate
npm run db:push

# Popular dados demo
npm run db:seed

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Login demo (após seed)

| Campo | Valor |
|-------|-------|
| Identificador | `demo` |
| E-mail | `admin@demo.com` |
| Senha | `demo1234` |

Ou crie sua oficina em `/register`.

## Estrutura

```
src/
├── app/(dashboard)/     # Páginas dos módulos
├── components/          # UI e layout
├── config/modules.ts    # Navegação e features
└── lib/                 # Prisma, utils
prisma/
└── schema.prisma        # Modelo completo do banco
```
