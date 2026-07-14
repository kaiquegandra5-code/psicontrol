"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
import { formatCPF, formatPhone } from "@/lib/utils/validators";
import { toast } from "@/components/ui/toaster";
import {
  createPatientAction,
  updatePatientAction,
  type PatientActionState,
} from "./actions";
import type { Patient } from "@/types/database";

interface PatientFormProps {
  patient?: Patient;
}

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} leftIcon={<Save className="h-4 w-4" />}>
      {isEdit ? "Salvar alterações" : "Criar paciente"}
    </Button>
  );
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();

  const action = async (
    _prev: PatientActionState,
    formData: FormData
  ): Promise<PatientActionState> => {
    if (patient) {
      return updatePatientAction(patient.id, _prev, formData);
    }
    return createPatientAction(_prev, formData);
  };

  const [state, formAction] = useActionState<PatientActionState, FormData>(action, {});

  React.useEffect(() => {
    if (state?.error) toast.error("Erro", state.error);
    if (state?.success) toast.success("Sucesso", state.success);
  }, [state]);

  // Format masked inputs
  const [cpf, setCpf] = React.useState(patient?.cpf ?? "");
  const [phone, setPhone] = React.useState(patient?.phone ?? "");
  const [status, setStatus] = React.useState(patient?.status ?? "active");

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
          <Link href="/patients">Voltar</Link>
        </Button>
        <SubmitButton isEdit={!!patient} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={patient?.full_name}
                  required
                  error={fieldErrors.full_name}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    error={fieldErrors.cpf}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de nascimento</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    defaultValue={patient?.birth_date ?? ""}
                    error={fieldErrors.birth_date}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    error={fieldErrors.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={patient?.email ?? ""}
                    error={fieldErrors.email}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Informações adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Contato de emergência</Label>
                <Input
                  id="emergency_contact"
                  name="emergency_contact"
                  defaultValue={patient?.emergency_contact ?? ""}
                  placeholder="Nome e telefone"
                  error={fieldErrors.emergency_contact}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={patient?.address ?? ""}
                  error={fieldErrors.address}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações gerais</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={patient?.notes ?? ""}
                  rows={4}
                  placeholder="Anotações importantes sobre o paciente…"
                  error={fieldErrors.notes}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="hidden" name="status" value={status} />
              <Select value={status} onValueChange={(v) => setStatus(v as Patient["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {patient && (
            <Card elevation={2}>
              <CardHeader>
                <CardTitle>Identificador</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-on-surface-variant">ID</p>
                <p className="text-body-sm font-mono mt-1 break-all">{patient.id}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
