import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, FileText } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { DeleteRecordButton } from "./delete-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecordDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("clinical_records")
    .select("*, patient:patients(id, full_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!record) notFound();

  return (
    <>
      <Header
        title="Evolução clínica"
        subtitle={`${(record.patient as any).full_name} · ${formatDate(record.session_date)}`}
      />

      <div className="px-8 py-8 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
            <Link href="/clinical-records">Voltar</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />} asChild>
              <Link href={`/clinical-records/${record.id}/edit`}>Editar</Link>
            </Button>
            <DeleteRecordButton id={record.id} patientId={record.patient_id} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          {record.session_number && <Badge variant="neutral">Sessão #{record.session_number}</Badge>}
          <span>·</span>
          <span>Criado em {formatDateTime(record.created_at)}</span>
          {record.updated_at !== record.created_at && (
            <>
              <span>·</span>
              <span>Editado em {formatDateTime(record.updated_at)}</span>
            </>
          )}
        </div>

        <RecordSection title="Evolução" content={record.evolution_text} />

        <RecordSection title="Objetivos terapêuticos" content={record.therapeutic_goals} />
        <RecordSection title="Intervenções realizadas" content={record.interventions} />
        <RecordSection title="Observações" content={record.observations} />

        <Card elevation={1} className="border-amber-200/60 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="text-amber-900">Notas internas</CardTitle>
            <CardDescription className="text-amber-800/80">
              Visível apenas para você. Não será incluído em documentos exportados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {record.internal_notes ? (
              <p className="clinical-text text-on-surface whitespace-pre-line">
                {record.internal_notes}
              </p>
            ) : (
              <p className="text-body-sm text-on-surface-variant italic">
                Nenhuma nota interna.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RecordSection({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <Card elevation={2}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="clinical-text text-on-surface whitespace-pre-line">{content}</p>
      </CardContent>
    </Card>
  );
}
