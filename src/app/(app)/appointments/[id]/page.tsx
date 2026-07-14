import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MapPin,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils/format";
import { AppointmentStatusButtons } from "./status-buttons";
import { DeleteAppointmentButton } from "./delete-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusMap: Record<string, { label: string; variant: "info" | "success" | "error" | "warning"; color: string }> = {
  scheduled: { label: "Agendada", variant: "info", color: "bg-primary/8 text-primary" },
  completed: { label: "Concluída", variant: "success", color: "bg-tertiary/10 text-tertiary" },
  cancelled: { label: "Cancelada", variant: "error", color: "bg-error/10 text-error" },
  no_show: { label: "Faltou", variant: "warning", color: "bg-amber-100 text-amber-700" },
};

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*, patient:patients(id, full_name, phone, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!appointment) notFound();

  const s = statusMap[appointment.status];

  return (
    <>
      <Header
        title="Consulta"
        subtitle={`${formatDate(appointment.appointment_date)} às ${formatTime(appointment.appointment_time)}`}
      />

      <div className="px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
            <Link href="/appointments">Voltar para agenda</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />} asChild>
              <Link href={`/appointments/${appointment.id}/edit`}>Editar</Link>
            </Button>
            <DeleteAppointmentButton id={appointment.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card elevation={2}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detalhes</CardTitle>
                  <CardDescription>Informações da consulta</CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-label-sm font-medium ${s.color}`}>
                  {s.label}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={<Calendar className="h-4 w-4" />} label="Data">
                    {formatDate(appointment.appointment_date, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                  </InfoItem>
                  <InfoItem icon={<Clock className="h-4 w-4" />} label="Horário">
                    {formatTime(appointment.appointment_time)} ({appointment.duration_minutes} min)
                  </InfoItem>
                  <InfoItem
                    icon={appointment.appointment_type === "online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    label="Modalidade"
                  >
                    {appointment.appointment_type === "online" ? "Online" : "Presencial"}
                  </InfoItem>
                  <InfoItem icon={<AlertCircle className="h-4 w-4" />} label="Valor">
                    {formatCurrency(appointment.price)}
                  </InfoItem>
                </div>
                {appointment.notes && (
                  <div className="pt-4 border-t border-outline-variant/40">
                    <p className="text-label-sm text-on-surface-variant">Observações</p>
                    <p className="mt-1 clinical-text text-on-surface whitespace-pre-line">
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardHeader>
                <CardTitle>Ações rápidas</CardTitle>
                <CardDescription>Atualize o status da consulta</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentStatusButtons
                  id={appointment.id}
                  currentStatus={appointment.status as "scheduled" | "completed" | "cancelled" | "no_show"}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card elevation={2}>
              <CardHeader>
                <CardTitle>Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/patients/${(appointment.patient as any).id}`}
                  className="block p-3 -m-3 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary text-label-md shrink-0">
                      {(appointment.patient as any).full_name
                        .split(" ")
                        .slice(0, 2)
                        .map((s: string) => s[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-label-md text-on-surface truncate">
                        {(appointment.patient as any).full_name}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">Ver prontuário</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-body-md text-on-surface">{children}</p>
    </div>
  );
}
