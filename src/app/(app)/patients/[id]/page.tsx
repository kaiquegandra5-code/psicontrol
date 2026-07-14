import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertCircle,
  FileText,
  CalendarCheck,
  Pencil,
  Trash2,
  FilePlus,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import { formatDate, formatTime, formatCurrency, ageFromBirthDate } from "@/lib/utils/format";
import { formatPhone, formatCPF } from "@/lib/utils/validators";
import { DeletePatientButton } from "./delete-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusMap = {
  active: { label: "Ativo", variant: "success" as const },
  inactive: { label: "Inativo", variant: "neutral" as const },
  archived: { label: "Arquivado", variant: "outline" as const },
};

export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!patient) notFound();

  const [{ data: appointments }, { data: records }, { data: documents }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", id)
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: false })
      .limit(10),
    supabase
      .from("clinical_records")
      .select("*")
      .eq("patient_id", id)
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(10),
    supabase
      .from("generated_documents")
      .select("*")
      .eq("patient_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const age = ageFromBirthDate(patient.birth_date);
  const s = statusMap[patient.status as keyof typeof statusMap];

  return (
    <>
      <Header
        title={patient.full_name}
        subtitle={`${age !== null ? `${age} anos` : ""} ${patient.cpf ? `· ${formatCPF(patient.cpf)}` : ""}`}
        action={{
          label: "Nova consulta",
          href: `/appointments/new?patient_id=${patient.id}`,
          icon: <CalendarCheck className="h-4 w-4" />,
        }}
      />

      <div className="px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
            <Link href="/patients">Voltar para pacientes</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />} asChild>
              <Link href={`/patients/${patient.id}/edit`}>Editar</Link>
            </Button>
            <DeletePatientButton id={patient.id} name={patient.full_name} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card elevation={2}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informações</CardTitle>
                  <CardDescription>Dados cadastrais do paciente</CardDescription>
                </div>
                <Badge variant={s.variant}>{s.label}</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Data de nascimento">
                  {formatDate(patient.birth_date) || "—"}
                </InfoItem>
                <InfoItem icon={<Phone className="h-4 w-4" />} label="Telefone">
                  {patient.phone ? formatPhone(patient.phone) : "—"}
                </InfoItem>
                <InfoItem icon={<Mail className="h-4 w-4" />} label="E-mail">
                  {patient.email || "—"}
                </InfoItem>
                <InfoItem icon={<AlertCircle className="h-4 w-4" />} label="Contato de emergência">
                  {patient.emergency_contact || "—"}
                </InfoItem>
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Endereço"
                  className="md:col-span-2"
                >
                  {patient.address || "—"}
                </InfoItem>
                {patient.notes && (
                  <div className="md:col-span-2 pt-2 border-t border-outline-variant/30">
                    <p className="text-label-sm text-on-surface-variant">Observações</p>
                    <p className="mt-1 clinical-text text-on-surface whitespace-pre-line">
                      {patient.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointments */}
            <Card elevation={2}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Consultas</CardTitle>
                  <CardDescription>Histórico de consultas</CardDescription>
                </div>
                <Button size="sm" variant="outline" leftIcon={<CalendarCheck className="h-4 w-4" />} asChild>
                  <Link href={`/appointments/new?patient_id=${patient.id}`}>Nova consulta</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <ul className="divide-y divide-divider">
                    {appointments.map((a) => (
                      <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                        <Link
                          href={`/appointments/${a.id}`}
                          className="flex items-center justify-between -mx-2 px-2 py-1.5 rounded-md hover:bg-surface-container-low"
                        >
                          <div>
                            <p className="text-label-md text-on-surface">
                              {formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}
                            </p>
                            <p className="text-body-sm text-on-surface-variant">
                              {a.appointment_type === "online" ? "Online" : "Presencial"} ·{" "}
                              {formatCurrency(a.price)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              a.status === "completed"
                                ? "success"
                                : a.status === "cancelled"
                                ? "error"
                                : "info"
                            }
                          >
                            {a.status === "scheduled"
                              ? "Agendada"
                              : a.status === "completed"
                              ? "Concluída"
                              : a.status === "cancelled"
                              ? "Cancelada"
                              : "Faltou"}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-6">
                    Nenhuma consulta registrada.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Clinical records */}
            <Card elevation={2}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Prontuário</CardTitle>
                  <CardDescription>Evoluções e notas clínicas</CardDescription>
                </div>
                <Button size="sm" variant="outline" leftIcon={<FilePlus className="h-4 w-4" />} asChild>
                  <Link href={`/clinical-records/new?patient_id=${patient.id}`}>Nova evolução</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {records && records.length > 0 ? (
                  <ul className="space-y-3">
                    {records.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/clinical-records/${r.id}`}
                          className="block p-3 rounded-lg border border-outline-variant/40 hover:bg-surface-container-lowest transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-label-md text-on-surface">
                              Sessão de {formatDate(r.session_date)}
                            </p>
                            {r.session_number && (
                              <Badge variant="neutral">#{r.session_number}</Badge>
                            )}
                          </div>
                          {r.evolution_text && (
                            <p className="text-body-sm text-on-surface-variant line-clamp-2 clinical-text">
                              {r.evolution_text}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-6">
                    Nenhuma evolução registrada.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card elevation={2}>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>Atestados, declarações e relatórios</CardDescription>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <ul className="space-y-2">
                    {documents.map((d) => (
                      <li key={d.id}>
                        <a
                          href={d.pdf_url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-3 rounded-lg border border-outline-variant/40 hover:bg-surface-container-lowest transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <p className="text-label-md text-on-surface truncate flex-1">
                              {d.title}
                            </p>
                          </div>
                          <p className="mt-1 text-body-sm text-on-surface-variant">
                            {formatDate(d.created_at)}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-4">
                    Nenhum documento gerado.
                  </p>
                )}
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href={`/documents/new?patient_id=${patient.id}`}>
                    Gerar documento
                  </Link>
                </Button>
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
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-body-md text-on-surface">{children}</p>
    </div>
  );
}
