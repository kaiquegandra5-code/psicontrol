"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Calendar, CalendarCheck, Video, MapPin, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatTime, formatCurrency, todayISO, toISODate } from "@/lib/utils/format";

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled" | "no_show";

const statusMap: Record<string, { label: string; variant: "info" | "success" | "error" | "warning" }> = {
  scheduled: { label: "Agendada", variant: "info" },
  completed: { label: "Concluída", variant: "success" },
  cancelled: { label: "Cancelada", variant: "error" },
  no_show: { label: "Faltou", variant: "warning" },
};

export function AppointmentsList() {
  const router = useRouter();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<StatusFilter>("all");
  const [view, setView] = React.useState<"upcoming" | "all">("upcoming");

  const fetchAppointments = React.useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("appointments")
      .select("*, patient:patients(full_name)")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(100);

    if (view === "upcoming") {
      query = query
        .gte("appointment_date", todayISO())
        .in("status", ["scheduled"]);
    }

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (!error) setAppointments(data ?? []);
    setLoading(false);
  }, [filter, view]);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Group by date
  const grouped = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of appointments) {
      const key = a.appointment_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [appointments]);

  return (
    <>
      <Header
        title="Agenda"
        subtitle="Suas consultas e compromissos"
        action={{ label: "Nova consulta", href: "/appointments/new", icon: <Plus className="h-4 w-4" /> }}
      />
      <div className="px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-outline-variant/60 bg-paper p-1">
            <button
              onClick={() => setView("upcoming")}
              className={`px-3 h-8 text-label-md rounded-md transition-colors ${
                view === "upcoming" ? "bg-primary text-primary-foreground" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setView("all")}
              className={`px-3 h-8 text-label-md rounded-md transition-colors ${
                view === "all" ? "bg-primary text-primary-foreground" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Todas
            </button>
          </div>

          <div className="w-48">
            <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="no_show">Faltas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-6 w-6" />}
            title="Nenhuma consulta encontrada"
            description={view === "upcoming" ? "Você não tem consultas agendadas." : "Tente ajustar os filtros."}
            action={
              view === "upcoming" && (
                <Button leftIcon={<Plus className="h-4 w-4" />} asChild>
                  <Link href="/appointments/new">Agendar consulta</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-label-md text-on-surface">
                      {formatDate(date, { weekday: "long", day: "2-digit", month: "long" })}
                    </p>
                    {date === todayISO() && (
                      <p className="text-body-sm text-tertiary font-medium">Hoje</p>
                    )}
                  </div>
                </div>
                <Card elevation={1} className="overflow-hidden">
                  <ul className="divide-y divide-divider">
                    {items.map((apt) => {
                      const s = statusMap[apt.status];
                      return (
                        <li
                          key={apt.id}
                          onClick={() => router.push(`/appointments/${apt.id}`)}
                          className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-container-lowest/50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center w-14 shrink-0">
                            <Clock className="h-4 w-4 text-on-surface-variant" />
                            <p className="mt-1 text-label-md text-on-surface">
                              {formatTime(apt.appointment_time)}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-label-md text-on-surface truncate">
                              {apt.patient?.full_name ?? "Paciente"}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-body-sm text-on-surface-variant">
                              <span className="flex items-center gap-1">
                                {apt.appointment_type === "online" ? (
                                  <>
                                    <Video className="h-3.5 w-3.5" />
                                    Online
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-3.5 w-3.5" />
                                    Presencial
                                  </>
                                )}
                              </span>
                              <span>·</span>
                              <span>{formatCurrency(apt.price)}</span>
                              {apt.notes && (
                                <>
                                  <span>·</span>
                                  <span className="truncate max-w-[200px]">{apt.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
