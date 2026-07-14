"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FilePlus, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { getSignedDocumentUrlAction, deleteDocumentAction } from "./actions";
import { toast } from "@/components/ui/toaster";

const typeMap: Record<string, { label: string; variant: "info" | "success" | "warning" | "neutral" | "default" }> = {
  declaration: { label: "Declaração", variant: "info" },
  certificate: { label: "Atestado", variant: "success" },
  referral: { label: "Encaminhamento", variant: "warning" },
  contract: { label: "Contrato", variant: "neutral" },
  report: { label: "Relatório", variant: "default" },
  other: { label: "Outro", variant: "neutral" },
};

export function DocumentsList() {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetch = React.useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("generated_documents")
      .select("*, patient:patients(id, full_name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error) {
      let filtered = data ?? [];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.title?.toLowerCase().includes(q) ||
            d.patient?.full_name?.toLowerCase().includes(q)
        );
      }
      setDocuments(filtered);
    }
    setLoading(false);
  }, [search]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  async function handleOpen(id: string) {
    // Server action that signs URL and redirects
    const result = await getSignedDocumentUrlAction(id);
    if (result?.error) toast.error("Erro", result.error);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir o documento "${title}"?`)) return;
    const result = await deleteDocumentAction(id);
    if (result?.error) toast.error("Erro", result.error);
    else {
      toast.success("Documento excluído");
      fetch();
    }
  }

  return (
    <>
      <Header
        title="Documentos"
        subtitle="Documentos clínicos gerados"
        action={{ label: "Gerar documento", href: "/documents/new", icon: <FilePlus className="h-4 w-4" /> }}
      />
      <div className="px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 max-w-md min-w-[200px]">
            <SearchInput
              placeholder="Buscar por título ou paciente…"
              value={search}
              onSearch={setSearch}
            />
          </div>
          <Button variant="outline" asChild>
            <Link href="/documents/templates">Gerenciar modelos</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={search ? "Nenhum documento encontrado" : "Você ainda não gerou documentos"}
            description={
              search
                ? "Tente uma busca diferente."
                : "Crie declarações, atestados e contratos com poucos cliques."
            }
            action={
              !search && (
                <Button leftIcon={<FilePlus className="h-4 w-4" />} asChild>
                  <Link href="/documents/new">Gerar primeiro documento</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const t = typeMap[doc.document_type] ?? typeMap.other;
              return (
                <Card key={doc.id} elevation={2} className="hover:shadow-elevation-3 transition-shadow group">
                  <button
                    onClick={() => handleOpen(doc.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge variant={t.variant}>{t.label}</Badge>
                    </div>
                    <h3 className="text-label-md text-on-surface line-clamp-2 min-h-[2.5rem]">
                      {doc.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-on-surface-variant">
                      {doc.patient?.full_name ?? "Paciente"}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {formatDate(doc.created_at)}
                    </p>
                  </button>
                  <div className="px-5 pb-4 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id, doc.title)}
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
      </div>
    </>
  );
}
