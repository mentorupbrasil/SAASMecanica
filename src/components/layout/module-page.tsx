import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ModulePageProps = {
  title: string;
  description: string;
  features: string[];
  actions?: { label: string; href?: string }[];
};

export function ModulePage({
  title,
  description,
  features,
  actions = [{ label: "Novo registro" }],
}: ModulePageProps) {
  return (
    <>
      <Header
        title={title}
        description={description}
        action={
          actions[0]?.href ? (
            <Link href={actions[0].href}>
              <Button>
                <Plus className="h-4 w-4" />
                {actions[0].label}
              </Button>
            </Link>
          ) : (
            <Button>
              <Plus className="h-4 w-4" />
              {actions[0]?.label}
            </Button>
          )
        }
      />

      <div className="p-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <Card key={feature}>
              <CardHeader>
                <CardTitle className="text-base">{feature}</CardTitle>
                <CardDescription>Módulo em desenvolvimento ativo</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="info">Em breve funcional</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades previstas neste módulo</CardTitle>
            <CardDescription>
              Arquitetura e banco de dados já modelados — implementação de telas em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 md:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
