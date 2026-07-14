import Link from "next/link";
import {
  Users,
  Calendar,
  CalendarCheck,
  FileText,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime, formatCurrency, ageFromBirthDate } from "@/lib/utils/format";
import { todayISO } from "@/lib/utils/format";

export const metadata = {
  title: "Visão geral",
};

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const today = todayISO();

  // Stats queries in parallel
  const [
    { count: totalPatients },
    { data: todayAppointments },
    { data: upcomingAppointments },
    { data: recentRecords },
    { data: monthlyAppointments },
  ] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("appointments")
      .select("*, patient:patients(full_name)")
      .eq("user_id", user.id)
      .eq("appointment_date", today)
      .in("status", ["scheduled"])
      .order("appointment_time", { ascending: true }),
    supabase
      .from("appointments")
      .select("*, patient:patients(full_name)")
      .eq("user_id", user.id)
      .gt("appointment_date", today)
      .in("status", ["scheduled"])
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(5),
    supabase
      .from("clinical_records")
      .select("*, patient:patients(full_name)")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(5),
    supabase
      .from("appointments")
      .select("price, status, appointment_date")
      .eq("user_id", user.id)
      .gte("appointment_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)),
  ]);

  const monthRevenue = (monthlyAppointments ?? [])
    .filter((a) => a.status === "completed")
    .reduce((acc, a) => acc + Number(a.price ?? 0), 0);

  const completedThisMonth = (monthlyAppointments ?? []).filter((a) => a.status === "completed").length;

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "Psicólogo(a)";

  return (
    <>
      <Header
        title={`Olá, ${firstName} 👋`}
        subtitle="Aqui está o resumo da sua prática hoje."
        action={{
          label: "Nova consulta",
          href: "/appointments/new",
          icon: <Calendar className="h-4 w-4" />,
        }}
      />

      <div className="px-8 py-8 space-y-8">
        {/* Welcome card (for empty state) */}
        {totalPatients === 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" elevation={2}>
            <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-headline-md font-heading">Bem-vindo(a) ao Psiorganizer!</h2>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Comece adicionando seu primeiro paciente para acessar a agenda e os prontuários.
                </p>
              </div>
              <Button size="lg" leftIcon={<Users className="h-4 w-4" />} asChild>
                <Link href="/patients/new">Adicionar paciente</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de pacientes"
            value={totalPatients ?? 0}
            icon={Users}
            tone="primary"
            trend="Ativos no seu consultório"
          />
          <StatCard
            label="Consultas hoje"
            value={todayAppointments?.length ?? 0}
            icon={CalendarCheck}
            tone="tertiary"
            trend="Agendadas para hoje"
          />
          <StatCard
            label="Sessões no mês"
            value={completedThisMonth}
            icon={TrendingUp}
            tone="info"
            trend="Concluídas este mês"
          />
          <StatCard
            label="Faturamento do mês"
            value={formatCurrency(monthRevenue)}
            icon={Activity}
            tone="warning"
            trend="Sessões concluídas"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's appointments */}
          <Card className="lg:col-span-2" elevation={2}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Consultas de hoje</CardTitle>
                <CardDescription>{formatDate(new Date(), { weekday: "long", day: "2-digit", month: "long" })}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />} asChild>
                <Link href="/appointments">Ver agenda</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayAppointments && todayAppointments.length > 0 ? (
                <div className="space-y-2">
                  {todayAppointments.map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-md text-on-surface truncate">
                          {apt.patient?.full_name ?? "Paciente"}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {formatTime(apt.appointment_time)} · {apt.appointment_type === "online" ? "Online" : "Presencial"}
                        </p>
                      </div>
                      <Badge variant={apt.appointment_type === "online" ? "info" : "neutral"}>
                        {apt.appointment_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyHint
                  text="Nenhuma consulta agendada para hoje."
                  cta="Agendar consulta"
                  href="/appointments/new"
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Próximas consultas</CardTitle>
              <CardDescription>Da sua agenda</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt: any) => (
                    <Link
                      key={apt.id}
                      href={`/appointments/${apt.id}`}
                      className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-label-md text-on-surface truncate">
                          {apt.patient?.full_name ?? "Paciente"}
                        </p>
                        <p className="text-label-sm text-primary shrink-0 ml-2">
                          {formatDate(apt.appointment_date, { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                      <p className="mt-0.5 text-body-sm text-on-surface-variant">
                        {formatTime(apt.appointment_time)} · {apt.appointment_type}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant text-center py-6">
                  Sem consultas futuras.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent records */}
        <Card elevation={2}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas evoluções</CardTitle>
              <CardDescription>Registros recentes nos prontuários</CardDescription>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />} asChild>
              <Link href="/clinical-records">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRecords && recentRecords.length > 0 ? (
              <div className="space-y-2">
                {recentRecords.map((rec: any) => (
                  <Link
                    key={rec.id}
                    href={`/clinical-records/${rec.id}`}
                    className="block p-4 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-label-md text-on-surface">{rec.patient?.full_name ?? "Paciente"}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {formatDate(rec.session_date)}
                      </p>
                    </div>
                    {rec.evolution_text && (
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 clinical-text">
                        {rec.evolution_text}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyHint
                text="Nenhuma evolução registrada ainda."
                cta="Criar evolução"
                href="/clinical-records/new"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "tertiary" | "info" | "warning";
  trend: string;
}) {
  const toneClasses = {
    primary: "bg-primary/8 text-primary",
    tertiary: "bg-tertiary/10 text-tertiary",
    info: "bg-secondary/10 text-secondary",
    warning: "bg-amber-100 text-amber-700",
  } as const;

  return (
    <Card elevation={2} className="hover:shadow-elevation-3 transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-label-sm text-on-surface-variant">{label}</p>
        <p className="mt-1 text-headline-lg font-heading">{value}</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">{trend}</p>
      </CardContent>
    </Card>
  );
}

function EmptyHint({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-body-md text-on-surface-variant">{text}</p>
      <Button variant="outline" size="sm" className="mt-3" asChild>
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
