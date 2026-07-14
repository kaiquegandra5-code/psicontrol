"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
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
import { toast } from "@/components/ui/toaster";
import { updateTemplateAction } from "../../actions";
import type { DocumentTemplate } from "@/types/database";

export function TemplateEditor({ template }: { template: DocumentTemplate }) {
  const [name, setName] = React.useState(template.name);
  const [type, setType] = React.useState<DocumentTemplate["type"]>(template.type);
  const [content, setContent] = React.useState(template.content);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("type", type);
    fd.append("content", content);
    const result = await updateTemplateAction(template.id, fd);
    setLoading(false);
    if (result?.error) toast.error("Erro", result.error);
    else toast.success("Modelo atualizado");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
          <Link href="/documents/templates">Voltar</Link>
        </Button>
        <Button type="submit" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>
          Salvar
        </Button>
      </div>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>Defina o nome, tipo e conteúdo do modelo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="tpl-name">Nome</Label>
              <Input
                id="tpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
          <CardDescription>
            Use <code className="px-1.5 py-0.5 rounded bg-surface-container-low text-body-sm">{"{{variavel}}"}</code>{" "}
            para inserir dados dinâmicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono text-body-sm"
            required
          />
        </CardContent>
      </Card>
    </form>
  );
}
