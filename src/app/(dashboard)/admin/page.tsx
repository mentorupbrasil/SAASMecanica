import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview, updateTenantSettings } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/session";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ClipboardList, Car, ShieldCheck, Palette, MapPin } from "lucide-react";

export default async function AdminPage() {
  await requireAdmin();
  const { tenant, usersCount, activeUsers, recentLogs } = await getAdminOverview();
  const branch = tenant?.branches?.[0];

  async function saveSettings(formData: FormData) {
    "use server";
    await updateTenantSettings(formData);
  }

  return (
    <>
      <Header
        title="Painel Administrativo"
        description="Personalize sua empresa e gerencie usuários"
      />

      <div className="space-y-6 p-8">
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
          <strong>Como funciona:</strong> cada login está vinculado à sua empresa. Não existe
          seleção de empresa na tela de entrada — o sistema identifica automaticamente pelo seu
          e-mail. Outros clientes do SaaS têm bancos de dados separados e não acessam suas
          informações.
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Identificador interno</CardDescription>
              <CardTitle className="text-lg">{tenant?.slug}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default">Somente referência</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Usuários</CardDescription>
              <CardTitle className="text-2xl">{usersCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">{activeUsers} ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Clientes</CardDescription>
              <CardTitle className="text-2xl">{tenant?._count.customers ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ordens de serviço</CardDescription>
              <CardTitle className="text-2xl">{tenant?._count.workOrders ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                Dados da empresa
              </CardTitle>
              <CardDescription>
                Nome, contatos, logo e cor — aparecem no menu e documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da empresa *</Label>
                  <Input name="name" defaultValue={tenant?.name ?? ""} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input name="document" defaultValue={tenant?.document ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input name="phone" defaultValue={tenant?.phone ?? ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>E-mail de contato</Label>
                  <Input name="email" type="email" defaultValue={tenant?.email ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>URL do logo</Label>
                  <Input
                    name="logoUrl"
                    type="url"
                    placeholder="https://.../logo.png"
                    defaultValue={tenant?.logoUrl ?? ""}
                  />
                  <p className="text-xs text-slate-400">
                    Cole o link da imagem (PNG/JPG). Upload direto em breve.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Cor principal
                  </Label>
                  <Input
                    name="brandColor"
                    type="color"
                    defaultValue={tenant?.brandColor ?? "#ea580c"}
                    className="h-11 w-full max-w-[120px] cursor-pointer p-1"
                  />
                  <p className="text-xs text-slate-400">
                    Usada nos botões e destaques do sistema.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Plano: <strong>{tenant?.plan ?? "STARTER"}</strong> (definido pelo administrador
                  da plataforma)
                </div>

                <Button type="submit">Salvar identidade</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Endereço (matriz)
              </CardTitle>
              <CardDescription>Usado em orçamentos, OS impressa e WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveSettings} className="space-y-4">
                <input type="hidden" name="name" value={tenant?.name ?? ""} />
                <input type="hidden" name="phone" value={tenant?.phone ?? ""} />
                <input type="hidden" name="email" value={tenant?.email ?? ""} />
                <input type="hidden" name="document" value={tenant?.document ?? ""} />
                <input type="hidden" name="logoUrl" value={tenant?.logoUrl ?? ""} />
                <input type="hidden" name="brandColor" value={tenant?.brandColor ?? "#ea580c"} />

                <div className="space-y-2">
                  <Label>Logradouro</Label>
                  <Textarea
                    name="address"
                    rows={2}
                    defaultValue={branch?.address ?? ""}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Cidade</Label>
                    <Input name="city" defaultValue={branch?.city ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>UF</Label>
                    <Input name="state" maxLength={2} defaultValue={branch?.state ?? ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input name="zipCode" defaultValue={branch?.zipCode ?? ""} />
                </div>
                <Button type="submit">Salvar endereço</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Link
              href="/admin/usuarios"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Gerenciar usuários</p>
                <p className="text-sm text-slate-500">Equipe da sua empresa</p>
              </div>
            </Link>
            <Link
              href="/clientes"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <Car className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Cadastros</p>
                <p className="text-sm text-slate-500">Clientes e veículos</p>
              </div>
            </Link>
            <Link
              href="/relatorios"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Relatórios</p>
                <p className="text-sm text-slate-500">Faturamento e produtividade</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria recente</CardTitle>
            <CardDescription>Ações registradas na sua empresa</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum registro ainda.</p>
            ) : (
              <ul className="space-y-2">
                {recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span>
                      <strong>{log.action}</strong>
                      {log.user?.name ? ` — ${log.user.name}` : ""}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
