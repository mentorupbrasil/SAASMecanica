import {
  BarChart3,
  Calendar,
  Car,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Users,
  Wrench,
  Wallet,
  History,
  Bell,
  Target,
  ScanLine,
  Building2,
  Kanban,
  ShieldCheck,
} from "lucide-react";

export type ModuleItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
};

export type ModuleGroup = {
  title: string;
  items: ModuleItem[];
};

export const moduleGroups: ModuleGroup[] = [
  {
    title: "Operação",
    items: [
      {
        title: "Painel",
        href: "/",
        icon: LayoutDashboard,
        description: "Visão geral e KPIs",
      },
      {
        title: "Kanban OS",
        href: "/kanban",
        icon: Kanban,
        description: "Produção em tempo real",
        badge: "Novo",
      },
      {
        title: "Ordens de Serviço",
        href: "/ordens",
        icon: ClipboardList,
        description: "Abertura, diagnóstico e execução",
      },
      {
        title: "Orçamentos",
        href: "/orcamentos",
        icon: FileText,
        description: "Propostas e aprovação digital",
      },
      {
        title: "Agenda",
        href: "/agenda",
        icon: Calendar,
        description: "Agendamentos, boxes e mecânicos",
      },
      {
        title: "Inspeção Digital",
        href: "/inspecoes",
        icon: ScanLine,
        description: "Checklist multiponto com fotos",
        badge: "Novo",
      },
    ],
  },
  {
    title: "Cadastros",
    items: [
      {
        title: "Clientes",
        href: "/clientes",
        icon: Users,
        description: "CPF/CNPJ, contatos e endereço",
      },
      {
        title: "Veículos",
        href: "/veiculos",
        icon: Car,
        description: "Placa, chassi e quilometragem",
      },
      {
        title: "Funcionários",
        href: "/funcionarios",
        icon: Wrench,
        description: "Equipe, comissões e especialidades",
      },
      {
        title: "Fornecedores",
        href: "/fornecedores",
        icon: Building2,
        description: "Cadastro e histórico de compras",
      },
      {
        title: "Serviços",
        href: "/servicos",
        icon: Settings,
        description: "Catálogo de serviços",
      },
      {
        title: "Peças e Produtos",
        href: "/produtos",
        icon: Package,
        description: "Estoque, preços e NCM",
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        title: "Estoque",
        href: "/estoque",
        icon: Package,
        description: "Entradas, saídas e inventário",
      },
      {
        title: "Financeiro",
        href: "/financeiro",
        icon: Wallet,
        description: "Contas, fluxo de caixa e comissões",
      },
      {
        title: "Garantias",
        href: "/garantias",
        icon: Shield,
        description: "Peças, serviços e acionamentos",
      },
      {
        title: "Histórico Veículos",
        href: "/historico",
        icon: History,
        description: "Manutenções, peças e km",
      },
      {
        title: "Relatórios",
        href: "/relatorios",
        icon: BarChart3,
        description: "Faturamento, lucro e produtividade",
      },
      {
        title: "Metas & CRM",
        href: "/crm",
        icon: Target,
        description: "Metas, fidelidade e campanhas",
        badge: "Novo",
      },
      {
        title: "Notificações",
        href: "/notificacoes",
        icon: Bell,
        description: "WhatsApp, e-mail e lembretes",
      },
    ],
  },
];

export const adminModuleGroup: ModuleGroup = {
  title: "Administração",
  items: [
    {
      title: "Painel Admin",
      href: "/admin",
      icon: ShieldCheck,
      description: "Configurações e controle da oficina",
    },
    {
      title: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
      description: "Equipe, perfis e acessos",
    },
  ],
};

export const extraFeatures = [
  "Multi-tenant SaaS com filiais",
  "Portal do cliente (aprovação e acompanhamento)",
  "Kanban de produção em tempo real",
  "Inspeção digital multiponto (DVI) com fotos/vídeo",
  "Matriz de precificação (margem peças e mão de obra)",
  "Lembretes automáticos de revisão (km/tempo)",
  "Integração WhatsApp (OS, orçamento, confirmação)",
  "Assinatura digital e laudo técnico",
  "Importação XML NF-e para estoque",
  "Conciliação bancária e PIX",
  "Programa de fidelidade",
  "Campanhas de marketing pós-venda",
  "RBAC com perfis (dono, gerente, mecânico...)",
  "Auditoria completa de ações",
  "Metas de vendas e gamificação",
  "Gestão documental centralizada",
  "Hooks para NFS-e / NF-e",
  "Consulta placa/VIN (integração futura)",
  "PWA mobile para mecânicos",
];
