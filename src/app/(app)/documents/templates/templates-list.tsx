"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createTemplateAction, deleteTemplateAction } from "../actions";
import { toast } from "@/components/ui/toaster";
import type { DocumentTemplate } from "@/types/database";

const typeMap: Record<string, { label: string; variant: "info" | "success" | "warning" | "neutral" | "default" }> = {
  declaration: { label: "Declaração", variant: "info" },
  certificate: { label: "Atestado", variant: "success" },
  referral: { label: "Encaminhamento", variant: "warning" },
  contract: { label: "Contrato", variant: "neutral" },
  report: { label: "Relatório", variant: "default" },
  other: { label: "Outro", variant: "neutral" },
};

export function TemplatesList() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openCreate, setOpenCreate] = React.useState(false);

  const fetch = React.useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
    if (!error) setTemplates(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o modelo "${name}"?`)) return;
    const result = await deleteTemplateAction(id);
    if (result?.error) toast.error("Erro", result.error);
    else {
      toast.success("Modelo excluído");
      fetch();
    }
  }

  return (
    <>
      <Header
        title="Modelos de documentos"
        subtitle="Personalize os modelos padrão ou crie os seus"
        action={{ label: "Novo modelo", onClick: () => setOpenCreate(true), icon: <Plus className="h-4 w-4" /> }}
      />
      <div className="px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="Nenhum modelo"
            description="Crie seu primeiro modelo de documento."
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpenCreate(true)}>
                Novo modelo
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => {
              const type = typeMap[t.type] ?? typeMap.other;
              return (
                <Card key={t.id} elevation={2} className="hover:shadow-elevation-3 transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge variant={type.variant}>{type.label}</Badge>
                    </div>
                    <h3 className="text-label-md text-on-surface">{t.name}</h3>
                    <p className="mt-2 text-body-sm text-on-surface-variant line-clamp-3 font-mono">
                      {t.content.slice(0, 120)}…
                    </p>
                  </div>
                  <div className="px-5 pb-4 flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/documents/templates/${t.id}`)}
                      leftIcon={<Pencil className="h-4 w-4" />}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(t.id, t.name)}
                      className="text-on-surface-variant hover:text-error"
                    >
                      Excluir
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <CreateTemplateDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          onCreated={fetch}
        />
      </div>
    </>
  );
}

function CreateTemplateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<DocumentTemplate["type"]>("declaration");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("type", type);
    fd.append("content", content);
    const result = await createTemplateAction(fd);
    setLoading(false);
    if (result?.error) {
      toast.error("Erro", result.error);
    } else {
      toast.success("Modelo criado");
      setName("");
      setContent("");
      onOpenChange(false);
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Novo modelo de documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="tpl-name">Nome do modelo</Label>
                <Input
                  id="tpl-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Declaração personalizada"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as DocumentTemplate["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="declaration">Declaração</SelectItem>
                    <SelectItem value="certificate">Atestado</SelectItem>
                    <SelectItem value="referral">Encaminhamento</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-content">Conteúdo</Label>
              <Textarea
                id="tpl-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="font-mono text-body-sm"
                required
                placeholder="Use {{paciente_nome}}, {{data_atual}}, etc."
              />
              <p className="text-body-sm text-on-surface-variant">
                Variáveis disponíveis: paciente_nome, paciente_documento, paciente_idade,
                psicologo_nome, psicologo_crp, data_atual, data_sessao, horario_sessao…
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading}>
              Criar modelo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
