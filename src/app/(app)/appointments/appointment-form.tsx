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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  createAppointmentAction,
  updateAppointmentAction,
  type AppointmentActionState,
} from "./actions";
import type { Appointment, Patient } from "@/types/database";

interface AppointmentFormProps {
  appointment?: Appointment;
  defaultPatientId?: string;
  initialPatientId?: string;
}

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} leftIcon={<Save className="h-4 w-4" />}>
      {isEdit ? "Salvar alterações" : "Criar consulta"}
    </Button>
  );
}

export function AppointmentForm({ appointment, defaultPatientId, initialPatientId }: AppointmentFormProps) {
  const router = useRouter();
  const presetPatient = initialPatientId ?? defaultPatientId ?? appointment?.patient_id ?? "";

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = React.useState(true);
  const [patientId, setPatientId] = React.useState(presetPatient);
  const [type, setType] = React.useState<"online" | "presencial">(
    (appointment?.appointment_type as "online" | "presencial") ?? "presencial"
  );
  const [status, setStatus] = React.useState(appointment?.status ?? "scheduled");

  React.useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("patients")
        .select("id, full_name, status")
        .neq("status", "archived")
        .order("full_name");
      setPatients(data ?? []);
      setLoadingPatients(false);
    })();
  }, []);

  const action = async (
    _prev: AppointmentActionState,
    formData: FormData
  ): Promise<AppointmentActionState> => {
    if (appointment) {
      return updateAppointmentAction(appointment.id, _prev, formData);
    }
    return createAppointmentAction(_prev, formData);
  };

  const [state, formAction] = useActionState<AppointmentActionState, FormData>(action, {});

  React.useEffect(() => {
    if (state?.error) toast.error("Erro", state.error);
    if (state?.success) toast.success("Sucesso", state.success);
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
          <Link href="/appointments">Voltar</Link>
        </Button>
        <SubmitButton isEdit={!!appointment} />
      </div>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Detalhes da consulta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Paciente *</Label>
            {loadingPatients ? (
              <div className="flex h-11 items-center px-3 rounded-lg border border-outline-variant/60 bg-paper">
                <Spinner className="h-4 w-4 mr-2" />
                <span className="text-body-sm text-on-surface-variant">Carregando pacientes…</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Data *</Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="date"
                defaultValue={appointment?.appointment_date ?? ""}
                required
                error={fieldErrors.appointment_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Horário *</Label>
              <Input
                id="appointment_time"
                name="appointment_time"
                type="time"
                defaultValue={appointment?.appointment_time?.slice(0, 5) ?? ""}
                required
                error={fieldErrors.appointment_time}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (min)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={15}
                step={5}
                defaultValue={appointment?.duration_minutes ?? 50}
                error={fieldErrors.duration_minutes}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <input type="hidden" name="appointment_type" value={type} />
              <Select value={type} onValueChange={(v) => setType(v as "online" | "presencial")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min={0}
                defaultValue={appointment?.price ?? 0}
                error={fieldErrors.price}
              />
            </div>
            {appointment && (
              <div className="space-y-2">
                <Label>Status</Label>
                <input type="hidden" name="status" value={status} />
                <Select value={status} onValueChange={(v) => setStatus(v as Appointment["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="no_show">Faltou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {!appointment && <input type="hidden" name="status" value="scheduled" />}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={appointment?.notes ?? ""}
              rows={4}
              placeholder="Anotações sobre a consulta…"
              error={fieldErrors.notes}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
