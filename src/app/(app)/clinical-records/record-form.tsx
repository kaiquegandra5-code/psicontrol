"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import {
  createRecordAction,
  updateRecordAction,
  type RecordActionState,
} from "./actions";
import type { ClinicalRecord, Patient } from "@/types/database";

interface RecordFormProps {
  record?: ClinicalRecord;
  defaultPatientId?: string;
  initialPatientId?: string;
}

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} leftIcon={<Save className="h-4 w-4" />}>
      {isEdit ? "Salvar alterações" : "Criar registro"}
    </Button>
  );
}

export function RecordForm({ record, defaultPatientId, initialPatientId }: RecordFormProps) {
  const router = useRouter();
  const presetPatient = initialPatientId ?? defaultPatientId ?? record?.patient_id ?? "";

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = React.useState(true);
  const [patientId, setPatientId] = React.useState(presetPatient);

  React.useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("patients")
        .select("*")
        .order("full_name");
      setPatients(data ?? []);
      setLoadingPatients(false);
    })();
  }, []);

  const action = async (
    _prev: RecordActionState,
    formData: FormData
  ): Promise<RecordActionState> => {
    if (record) {
      return updateRecordAction(record.id, _prev, formData);
    }
    return createRecordAction(_prev, formData);
  };

  const [state, formAction] = useActionState<RecordActionState, FormData>(action, {});

  React.useEffect(() => {
    if (state?.error) toast.error("Erro", state.error);
    if (state?.success) {
      toast.success("Sucesso", state.success);
      if (state.redirectTo) router.push(state.redirectTo);
    }
  }, [state]);

  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          asChild
        >
          <Link href="/clinical-records">Voltar</Link>
        </Button>
        <SubmitButton isEdit={!!record} />
      </div>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
          <CardDescription>Defina o paciente e a data da sessão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Paciente *</Label>
            {loadingPatients ? (
              <div className="flex h-11 items-center px-3 rounded-lg border border-outline-variant/60 bg-paper">
                <Spinner className="h-4 w-4 mr-2" />
                <span className="text-body-sm text-on-surface-variant">Carregando…</span>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-outline-variant/60 bg-paper text-body-sm text-on-surface-variant">
                <User className="h-4 w-4" />
                Nenhum paciente cadastrado.{" "}
                <Link href="/patients/new" className="text-primary hover:underline">
                  Adicionar
                </Link>
              </div>
            ) : (
              <>
                <input type="hidden" name="patient_id" value={patientId} />
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.patient_id && (
                  <p className="text-body-sm text-error">{fieldErrors.patient_id}</p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_date">Data da sessão *</Label>
              <Input
                id="session_date"
                name="session_date"
                type="date"
                defaultValue={record?.session_date ?? new Date().toISOString().slice(0, 10)}
                required
                error={fieldErrors.session_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session_number">Nº da sessão</Label>
              <Input
                id="session_number"
                name="session_number"
                type="number"
                min={1}
                defaultValue={record?.session_number ?? ""}
                placeholder="Auto"
                error={fieldErrors.session_number}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Evolução clínica</CardTitle>
          <CardDescription>Registre a evolução do paciente nesta sessão</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="evolution_text"
            defaultValue={record?.evolution_text ?? ""}
            rows={8}
            placeholder="Descreva a evolução do paciente, temas abordados, insights…"
            className="clinical-text"
            error={fieldErrors.evolution_text}
          />
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Plano terapêutico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="therapeutic_goals">Objetivos terapêuticos</Label>
            <Textarea
              id="therapeutic_goals"
              name="therapeutic_goals"
              defaultValue={record?.therapeutic_goals ?? ""}
              rows={4}
              placeholder="Metas de curto, médio e longo prazo…"
              error={fieldErrors.therapeutic_goals}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interventions">Intervenções realizadas</Label>
            <Textarea
              id="interventions"
              name="interventions"
              defaultValue={record?.interventions ?? ""}
              rows={4}
              placeholder="Técnicas e abordagens utilizadas na sessão…"
              error={fieldErrors.interventions}
            />
          </div>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Observações internas</CardTitle>
          <CardDescription>Notas privadas — não aparecerão em documentos compartilháveis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              name="observations"
              defaultValue={record?.observations ?? ""}
              rows={3}
              error={fieldErrors.observations}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internal_notes">Notas internas</Label>
            <Textarea
              id="internal_notes"
              name="internal_notes"
              defaultValue={record?.internal_notes ?? ""}
              rows={3}
              placeholder="Reflexões privadas, dúvidas, supervisão…"
              error={fieldErrors.internal_notes}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
