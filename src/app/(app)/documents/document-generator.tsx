"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowLeft, FileText, User, Eye, Loader2 } from "lucide-react";
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
import { fillTemplate } from "@/lib/pdf/generator";
import { ageFromBirthDate, formatDate, formatTime } from "@/lib/utils/format";
import { generateDocumentAction } from "./actions";
import type { DocumentTemplate, Patient, Profile } from "@/types/database";

const typeLabels: Record<string, string> = {
  declaration: "Declaração",
  certificate: "Atestado",
  referral: "Encaminhamento",
  contract: "Contrato",
  report: "Relatório",
  other: "Outro",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} leftIcon={<FileText className="h-4 w-4" />}>
      Gerar PDF
    </Button>
  );
}

export function DocumentGenerator({ initialPatientId }: { initialPatientId?: string } = {}) {
  const router = useRouter();
  const presetPatient = initialPatientId ?? "";

  const [templates, setTemplates] = React.useState<DocumentTemplate[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);

  const [templateId, setTemplateId] = React.useState("");
  const [patientId, setPatientId] = React.useState(presetPatient);
  const [title, setTitle] = React.useState("");
  const [extras, setExtras] = React.useState<Record<string, string>>({});
  const [customContent, setCustomContent] = React.useState("");

  React.useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: t }, { data: p }, { data: pr }] = await Promise.all([
        supabase.from("document_templates").select("*").order("is_default", { ascending: false }).order("name"),
        supabase.from("patients").select("id, full_name, cpf, birth_date, phone, email, address").neq("status", "archived").order("full_name"),
        supabase.from("profiles").select("*").single(),
      ]);
      setTemplates(t ?? []);
      setPatients(p ?? []);
      setProfile(pr);
      setLoading(false);

      if (t && t.length > 0) {
        setTemplateId(t[0].id);
        setTitle(t[0].name);
      }
    })();
  }, []);

  const selectedTemplate = React.useMemo(
    () => templates.find((t) => t.id === templateId),
    [templates, templateId]
  );

  React.useEffect(() => {
    if (selectedTemplate) {
      setCustomContent(selectedTemplate.content);
      const patient = patients.find((p) => p.id === patientId);
      setTitle(patient ? `${selectedTemplate.name} — ${patient.full_name}` : selectedTemplate.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  const preview = React.useMemo(() => {
    if (!selectedTemplate || !patientId) return "";
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return "";
    const now = new Date();
    const values: Record<string, string> = {
      paciente_nome: patient.full_name,
      paciente_documento: patient.cpf ?? "",
      paciente_idade: ageFromBirthDate(patient.birth_date) !== null ? String(ageFromBirthDate(patient.birth_date)) : "",
      paciente_telefone: patient.phone ?? "",
      paciente_email: patient.email ?? "",
      paciente_endereco: patient.address ?? "",
      psicologo_nome: profile?.full_name ?? "",
      psicologo_crp: profile?.crp ?? "",
      psicologo_especialidade: profile?.specialty ?? "",
      cidade: "São Paulo",
      data_atual: now.toLocaleDateString("pt-BR"),
      data_sessao: formatDate(now),
      horario_sessao: formatTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`),
      duracao_sessao: "50",
      ...extras,
    };
    return fillTemplate(customContent || selectedTemplate.content, values);
  }, [customContent, selectedTemplate, patientId, patients, profile, extras]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId || !patientId || !title.trim()) {
      toast.error("Selecione um modelo, paciente e título.");
      return;
    }
    setGenerating(true);
    const result = await generateDocumentAction({
      templateId,
      patientId,
      title: title.trim(),
      extraValues: extras,
    });
    setGenerating(false);
    if (result?.error) {
      toast.error("Erro", result.error);
    } else {
      toast.success("Documento gerado!");
      router.push("/documents");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card elevation={2}>
        <CardContent className="p-8 text-center">
          <FileText className="h-8 w-8 text-on-surface-variant mx-auto" />
          <p className="mt-3 text-headline-sm text-on-surface">Nenhum modelo disponível</p>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Você precisa ter pelo menos um modelo para gerar documentos.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/documents/templates">Gerenciar modelos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          asChild
        >
          <Link href="/documents">Voltar</Link>
        </Button>
        <Button type="submit" isLoading={generating} leftIcon={<FileText className="h-4 w-4" />}>
          Gerar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>Selecione o modelo e o paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({typeLabels[t.type]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Paciente</Label>
                {patients.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-outline-variant/60 bg-paper text-body-sm text-on-surface-variant">
                    <User className="h-4 w-4" />
                    Nenhum paciente.{" "}
                    <Link href="/patients/new" className="text-primary hover:underline">
                      Adicionar
                    </Link>
                  </div>
                ) : (
                  <Select value={patientId} onValueChange={setPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do documento</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atestado - João Silva"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Modelo</CardTitle>
              <CardDescription>
                Você pode personalizar o conteúdo abaixo antes de gerar o PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={16}
                className="font-mono text-body-sm"
              />
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Use <code className="px-1.5 py-0.5 rounded bg-surface-container-low text-body-sm">{"{{variavel}}"}</code>{" "}
                para inserir dados dinâmicos.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card elevation={2} className="sticky top-24">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>Como o documento será renderizado</CardDescription>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-label-sm font-medium">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </span>
            </CardHeader>
            <CardContent>
              <div className="bg-white border border-outline-variant/40 rounded-lg p-8 max-h-[700px] overflow-y-auto">
                <h1 className="text-headline-md font-heading text-on-surface">
                  {title || "Título do documento"}
                </h1>
                {patientId && (
                  <p className="mt-2 text-body-sm text-on-surface-variant">
                    Paciente: {patients.find((p) => p.id === patientId)?.full_name}
                  </p>
                )}
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Data de emissão: {new Date().toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-6 pt-6 border-t border-outline-variant/40">
                  <pre className="whitespace-pre-wrap text-body-md text-on-surface font-sans">
                    {preview || "Selecione um modelo e paciente para visualizar."}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
